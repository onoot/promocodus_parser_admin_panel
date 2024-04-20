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
        const templates = req.body.date; // предположим, что 'date' - это массив шаблонов

        if (templates) {
            for (const template of templates) {
                // Ищем template по имени в базе данных
                const existingTemplate = await db.template.findOne({
                    where: {
                        name: template.name,
                    },
                });

                if (existingTemplate) {
                    // Удаляем найденную запись из базы данных
                    await existingTemplate.destroy();


                    await postHistory({
                        name: template.name,
                        lastRun: moscowTime,
                        type: 'delete',
                        urls: '',
                        parseUrls: false,
                    });
                } else {

                    await postHistory({
                        name: template.name,
                        lastRun: moscowTime,
                        type: 'no_delete',
                        urls: '',
                        parseUrls: false,
                    });
                    console.error(`Template with name ${template.name} not found.`);
                }
            }

            res.json({
                res: true,
                data: templates,
            });

        } else {
            res.json({
                res: false,
                error: 'No templates provided.',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
        await postHistory({
            name: 'Шаблон',
            lastRun: moscowTime,
            type: 'error_delete',
            urls: '',
            parseUrls: false,
        });
    }
}