import db from '../../../bd';

export default async function endPoint(req, res) {
    try {
        // Получаем все allTasks из базы данных
        const allTasks = await db.tasks.findAll();


        // Проверяем, есть allTasks ли данные в базе данных
        if (allTasks.length > 0) {
            // Обрабатываем каждый объект в массиве
            const tasksAll = []
            for (const task of allTasks) {
                    // Получаем шаблон из базы данных
                    const template = await db.template.findOne({
                        attributes: ['name'],
                        where: {id: task.dataValues.template},
                    });
                    const name = task.dataValues.name

                    if (template) {
                        task.dataValues.name = template.dataValues.name;
                        task.dataValues.name = name;
                    } else {
                        task.dataValues.name = `${name}, Шаблон был удален`;
                    }

                    // Добавляем обработанный объект в массив
                    tasksAll.push(task);
            }
            // Отправляем модифицированные данные клиенту
            res.json({
                res: true,
                data: tasksAll,
            });
        } else {
            res.json({
                res: false,
                error: 'No data found in the database.',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
    }
}
