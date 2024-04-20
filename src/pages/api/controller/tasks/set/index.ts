// Импортируем необходимые модели файла bd/index
import db from '../../../bd';

export default async function endPoint(req, res) {
    try {
        const requestData = req.body;

        if (!requestData || !requestData.date) {
            res.status(400).json({
                res: false,
                error: 'Данные не получены или отсутствует поле date!',
            });
            return;
        }

        const currentDate = new Date(); // Получаем текущую дату и время

        const tasks = Array.isArray(requestData.date) ? requestData.date : [requestData.date];

        for (const task of tasks) {
            const existingTask = await db.tasks.findOne({
                where: {
                    id: task.template,
                },
            });

            if (existingTask) {
                const value = task.value;

                if (value === false) {
                    await existingTask.update({
                        lastRun: currentDate,
                        run: true,
                    });
                    res.status(200).json({
                        res: true,
                        data: 'ok',
                    });
                    return;
                } else if (value === true) {
                    await existingTask.update({
                        run: false,
                    });
                    res.status(200).json({
                        res: true,
                        data: 'no',
                    });
                    return;
                }
            }
        }

        res.status(404).json({
            res: false,
            error: 'Задача не найдена', // Или любой другой текст ошибки
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
    }
}
