import db from './../../bd';

export async function setProgress(id: number, progress: number) {
    try {
        const existingTemplate = await db.shoptask.findOne({
            where: {
                id: id,
            },
        });
        if (existingTemplate) {
            await existingTemplate.update({
                completed: progress
            });
        }
    } catch (err) {
        console.error(`Ошибка обновления статуса: ${err.message}`);
    }
}