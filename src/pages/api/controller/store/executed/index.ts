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

    let mess

    try {
        const {bool, items, mes} = req.body.data; // Исправлено `date` на `data`

        mess=mes

        // Находим все магазины по массиву идентификаторов
        const stores = await db.store.findAll({
            where: {id: items},
            attributes: ['id', 'exception', 'imported'],
        });

        if (mes == 1) {
            // Обновляем поле exception для каждого магазина
            for (const store of stores) {
                await store.update({exception: bool}, {fields: ['exception']});
            }
            console.log('Добавление в исключение')
            await postHistory({
                name: 'Магазин',
                lastRun: moscowTime,
                type: 'set_exut',
                urls: '',
                parseUrls: false,
            });
        } else if (mes == 2) {
            // Обновляем поле imported для каждого магазина
            for (const store of stores) {
                await store.update({imported: bool}, {fields: ['imported']});
            }
            console.log('Добавление в импортированные')
            await postHistory({
                name: 'Магазин',
                lastRun: moscowTime,
                type: 'set_imported',
                urls: '',
                parseUrls: false,
            });
        }



        // Отправляем ответ об успешном обновлении
        res.json({
            res: true,
            message: "Template data updated successfully with unique store URLs.",
        });
        // else {
        //    // Если шаблон не предоставлен, отправляем ошибку
        //    res.status(400).json({
        //        res: false,
        //        error: 'Shop is required.',
        //    });
        //    await postHistory({
        //        name: 'Магазин',
        //        lastRun: moscowTime,
        //        type: 'not_set_exut',
        //        urls: '',
        //        parseUrls: false,
        //    });
        // }
    } catch (error) {
        console.error('Error during database operation:', error);
        res.status(500).json({
            res: false,
            error: 'Internal server error.',
        });
        await postHistory({
            name: 'Магазин',
            lastRun: moscowTime,
            type: mess==1?'error_set_exut':'error_set_imported',
            urls: '',
            parseUrls: false,
        });
    }
}