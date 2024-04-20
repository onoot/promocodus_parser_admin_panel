// Импортируем необходимые модели из вашего файла bd/index
import db from '../../../bd';
import postHistory from "../../history/post";

export default async function handler(req, res) {

    // Запись в историю с текущим временем по Москве
    const moscowTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        timeStyle: 'medium',
        dateStyle: 'medium',
    }).format(new Date());

    try {
        const date = req.body.date;
        if (date) {
            for (const template of date) {
                // Ищем template по URL в базе данных
                const existingTemplate = await db.template.findOne({
                    where: {
                        name: template.name,
                    },
                });
                if (existingTemplate) {
                    // Если template уже существует, обновляем его данные
                    await existingTemplate.update({
                        name: template.name,
                        lastRun: template.lastRun,
                        newAmount: template.newAmount,
                        changedAmount: template.changedAmount,
                        oldAmount: template.oldAmount,
                        interval: template.interval,
                        urls: template.urls,
                        parseUrls: template.parseUrls,
                    });


                    await postHistory({
                        name: template.name,
                        lastRun: moscowTime,
                        type: 'update_template',
                        urls: '',
                        parseUrls: false,
                    });
                } else {
                    // Если template нет, создаем новый
                    await db.template.create({
                        name: template.name,
                        lastRun: template.lastRun,
                        newAmount: template.newAmount,
                        changedAmount: template.changedAmount,
                        oldAmount: template.oldAmount,
                        interval: template.interval,
                        urls: template.urls,
                        parseUrls: template.parseUrls,
                    });

                    await postHistory({
                        name: template.name,
                        lastRun: moscowTime,
                        type: 'create_template',
                        urls: '',
                        parseUrls: false,
                    });
                }
            }

            res.json({
                res: true,
                data: date,
            });
        } else {
            res.json({
                res: false,
                error: 'Failed to parse data.',
            });
            await postHistory({
                name: 'Новый шаблон',
                lastRun: moscowTime,
                type: 'no_create_template',
                urls: '',
                parseUrls: false,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
        await postHistory({
            name: 'Новый шаблон',
            lastRun: moscowTime,
            type: 'error_create_template',
            urls: '',
            parseUrls: false,
        });
    }
}
