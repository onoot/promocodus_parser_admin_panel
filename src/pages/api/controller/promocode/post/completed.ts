import db from '../../../bd';

export async function completed(name: string, num: number) {
    try {
        // Ищем существующий шаблон по имени
        const existingTemplate = await db.template.findOne({
            where: {
                name: name,
            },
        });
        // Если шаблон существует...
        if (existingTemplate) {

            // Ищем задачу, связанную с этим шаблоном
            const existingTask = await db.tasks.findOne({
                where: {
                    template: existingTemplate.dataValues.id,
                },
            });

            // Если задача существует
            if (existingTask) {
                // Обновляем значение completed
                await existingTask.update({ completed: num });
            } else {
            }
        } else {
        }
    } catch (err) {
        console.error(`Ошибка обновления статуса: ${err.message}`);
    }
}