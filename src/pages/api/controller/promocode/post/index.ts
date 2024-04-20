import validUrl from 'valid-url';
import db from '../../../bd';
import postHistory from "../../history/post";
import {ParserPromocodusHTML} from './parserNew'

export default async function handler(req, res) {
    const moscowTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        timeStyle: 'medium',
        dateStyle: 'medium',
    }).format(new Date());

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ res: false, error: 'Missing ID parameter' });
        }

        // Найдем шаблон по 'id'
        const template = await db.template.findByPk(id, {
            attributes: ['id', 'name', 'urls', 'parseUrls']
        });

        if (!template) {
            // Если шаблон не найден, возвращаем ошибку
            return res.status(404).json({ res: false, error: 'Template not found' });
        }

        // Получаем имя из атрибутов шаблона
        const name = template.dataValues.name;
        const idT = template.dataValues.id;

        // Разбиваем `urls` из шаблона на массив и фильтруем пустые строки
        const urlsArray: string[] = template.dataValues.urls.split('\n').filter((url: string) => url.trim() !== '');

        await postHistory({
            name: name,
            lastRun: moscowTime,
            type: 'run_template',
            urls: '',
            parseUrls: false,
        });

        // Проверка каждой URL на валидность
        const isValidUrls = urlsArray.every(url => validUrl.isUri(url));

        if (!isValidUrls) {
            const invalidUrls = urlsArray.filter(url => !validUrl.isUri(url));
            return res.status(400).json({ res: false, error: 'Нет валидных ссылок', invalidUrls });
        }
        const task = await db.tasks.findOne({
            where:{
                template: idT
            },
            attributes: ['run']
        });

        if(task)
            if(!task.get('run')){
            console.log('Парсинг завершен (true)')
            res.json({ res: true, data: ''});
            return
        }

        //Здесь использовать массив urls, например, передать его в парсер
        const promoData = await new ParserPromocodusHTML().parseNew(urlsArray, name, idT);
        console.log(promoData)

        if (template) {
            // Ищем задачу, связанную с этим шаблоном
            const existingTask = await db.tasks.findOne({
                attributes: ['id', 'run', 'template'],
                where: {
                    template: template.get('id'),
                },
            });

            // Если задача существует
            if (existingTask) {
                const runValue = !template.get('parseUrls');
                console.log(runValue)
                await existingTask.update({ run: !runValue });
            }
        }

        console.log('Парсинг завершен')
        res.json({ res: true, data: promoData});

    } catch (error) {
        console.log(error);
        res.status(500).json({ res: false, error: 'Internal Server Error' });

        await postHistory({
            name: 'Ошибка при запуске',
            lastRun: moscowTime,
            type: 'error_run_template',
            urls: '',
            parseUrls: false,
        });
        console.log('Парсинг завершен с ошибкой')

    }
}
