import db from '../../../bd';

export default async function endPoint(req, res) {
    try {
        // Получаем все магазины из базы данных
        const allStores = await db.history.findAll();

        // Проверяем, есть ли данные в базе данных
        if (allStores.length > 0) {
            res.json({
                res: true,
                data: allStores,
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
