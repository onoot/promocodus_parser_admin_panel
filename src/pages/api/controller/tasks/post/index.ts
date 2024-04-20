// Импортируем необходимые модели файла bd/index
import db from '../../../bd';

export default async function endPoint(req, res) {
    try {
        const date = req.body.date;

        if (!date) {
            res.status(400).json({
                res: false,
                error: 'Данные не получены!',
            });
            return;
        }

        const currentDate = new Date(); // Получаем текущую дату и время

        for (const tasks of date) {
            // Ищем template по id в базе данных
            const existingTemplate = await db.template.findOne({
                attributes: ['id', 'name', 'interval', 'lastRun'],
                where: {
                    id: tasks.template,
                },
            });

            if (!existingTemplate) {
                res.status(404).json({
                    res: false,
                    data: 'idnon',
                });
                // Обновляем lastRun в шаблоне
                await existingTemplate.update({
                    lastRun: currentDate,
                });
                return;
            }

            // Извлекаем значение интервала
            const interval = existingTemplate.get('parseUrls');
            const name = existingTemplate.get('name');

            if (interval === false) {
                res.json({
                    res: false,
                    data: 'noadd',
                });
                // Обновляем lastRun в шаблоне
                await existingTemplate.update({
                    lastRun: currentDate,
                });
            }

            // Ищем tasks по id в базе данных
            const existingTasks = await db.tasks.findOne({
                where: {
                    template: tasks.template,
                },
            });

            if (existingTasks) {
                // Если tasks уже существует, обновляем его данные
                await existingTasks.update({
                    name: name,
                    lastRun: currentDate,
                    run: true,
                });
            } else {
                // Если tasks нет, создаем новый
                await db.tasks.create({
                    name: name,
                    lastRun: currentDate,
                    template: tasks.template,
                    run: true,
                });
            }

            // Обновляем lastRun в шаблоне
            await existingTemplate.update({
                lastRun: currentDate,
            });

            res.json({
                res: true,
                data: 'ok',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
    }
}
