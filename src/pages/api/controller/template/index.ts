import db from '../../bd';
import postHistory from "../history/post";


export default async function endPoint(req, res) {
    const moscowTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        timeStyle: 'medium',
        dateStyle: 'medium',
    }).format(new Date());

    try {

        const { id } = req.query;

        if (id) {
            // Если предоставлен параметр id, ищем конкретную запись в базе данных
            const template = await db.template.findOne({
                where: {
                    id: id,
                },
            });

            if (template) {
                res.json({
                    res: true,
                    data: template,
                });
            } else {
                res.json({
                    res: false,
                    error: 'Template not found.',
                });
            }
        } else {
            // Если параметр id не предоставлен, получаем все записи из базы данных
            const allTemplates = await db.template.findAll();

            if (allTemplates.length > 0) {
                res.json({
                    res: true,
                    data: allTemplates,
                });
            } else {
                res.json({
                    res: false,
                    error: 'No data found in the database.',
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
        await postHistory({
            name: 'Получение шаблона',
            lastRun: moscowTime,
            type: 'error_get_template',
            urls: '',
            parseUrls: false,
        });
    }
}
