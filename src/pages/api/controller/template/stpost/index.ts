import db from '../../../bd';
import postHistory from "../../history/post";

export default async function handler(req, res) {
    // ... предполагается, что импорты и начало обработчика опущены для краткости
    // Запись в историю с текущим временем по Москве
    const moscowTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        timeStyle: 'medium',
        dateStyle: 'medium',
    }).format(new Date());

    try {
        const { template: templateName, items: selectedItems } = req.body.data; // Исправлено `date` на `data`

        if (templateName) {
            // Ищем template по имени в базе данных
            const existingTemplate = await db.template.findOne({
                where: {
                    name: templateName,
                },
            });

            if (existingTemplate) {
                // Находим все магазины по массиву идентификаторов
                const stores = await db.store.findAll({
                    where: { id: selectedItems },
                    attributes: ['store_url'],
                });

                // Преобразуем результат в массив URL
                const newStoreUrls = stores.map(store => store.dataValues.store_url);
                console.log('Новые URLs:', newStoreUrls);

                // Извлекаем существующие URL-адреса из шаблона, если они есть, иначе создаем пустой массив
                const existingUrls = existingTemplate.urls ? existingTemplate.urls.split('\n') : [];
                console.log('Старые URLs:', existingUrls);

                // Объединение существующих и новых URL-адресов и удаление дубликатов
                const uniqueUrls = Array.from(new Set([...existingUrls, ...newStoreUrls]));

                // Обновление шаблона новым массивом URL-адресов в виде строки
                await existingTemplate.update({ urls: uniqueUrls.join('\n') });

                // Обновляем existingTemplate новым массивом уникальных URL в виде строки
                await existingTemplate.update({ urls: uniqueUrls.join('\n') });

                await postHistory({
                    name: templateName,
                    lastRun: moscowTime,
                    type: 'set_template',
                    urls: '',
                    parseUrls: false,
                });
                // Отправляем ответ об успешном обновлении
                res.json({
                    res: true,
                    message: "Template data updated successfully with unique store URLs.",
                });
            } else {
                await postHistory({
                    name: templateName,
                    lastRun: moscowTime,
                    type: 'no_set_template',
                    urls: '',
                    parseUrls: false,
                });
                // Обрабатываем случай, когда шаблон не был найден
                res.status(404).json({
                    res: false,
                    message: "Template not found.",
                });
            }
        } else {
            // Если шаблон не предоставлен, отправляем ошибку
            res.status(400).json({
                res: false,
                error: 'Template name is required.',
            });
            await postHistory({
                name: templateName,
                lastRun: moscowTime,
                type: 'not_set_template',
                urls: '',
                parseUrls: false,
            });
        }
    } catch (error) {
        console.error('Error during database operation:', error);
        res.status(500).json({
            res: false,
            error: 'Internal server error.',
        });
        await postHistory({
            name: 'Изменение шаблона',
            lastRun: moscowTime,
            type: 'error_set_template',
            urls: '',
            parseUrls: false,
        });
    }
}