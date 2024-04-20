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
        const tasks = req.body; // предположим, что 'date' - это массив шаблонов

        if (tasks) {
            for (const task of tasks) {
                // Ищем template по имени в базе данных
                const existingTemplate = await db.tasks.findOne({
                    where: {
                        id: task.id,
                    },
                });

                if (existingTemplate) {
                    // Удаляем найденную запись из базы данных
                    await existingTemplate.destroy();


                    await postHistory({
                        name: task.name,
                        lastRun: moscowTime,
                        type: 'task_delete',
                        urls: '',
                        parseUrls: false,
                    });

                } else {

                    await postHistory({
                        name: task.name,
                        lastRun: moscowTime,
                        type: 'no_task_delete',
                        urls: '',
                        parseUrls: false,
                    });
                    console.error(`Template with name ${task.name} not found.`);
                }
            }

            res.json({
                res: true,
                data: tasks,
            });

        } else {
            res.json({
                res: false,
                error: 'No tasks provided.',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
        await postHistory({
            name: 'Задача',
            lastRun: moscowTime,
            type: 'error_task_delete',
            urls: '',
            parseUrls: false,
        });
    }
}