import db from '../../../bd';
import json2csv from 'json2csv';
import {Readable} from 'stream';
import {format} from "date-fns";

interface TemplateAttributes {
    id: number;
    name: string;
    lastRun: number;
    newAmount: number;
    changedAmount: number;
    oldAmount: number;
    interval: number;
    urls: string;
    parseUrls: boolean;
}

export default async function handler(req, res) {
    try {
        const {id} = req.body;

        if (!id) {
            return res.status(400).json({res: false, error: 'Missing ID parameter'});
        }

        // Ищем template по Имени в базе данных
        const template = await db.template.findByPk(id);

        if (!template) {
            return res.status(404).json({res: false, error: 'Template not found'});
        }

        const templateData = template.get() as TemplateAttributes;

        // Разбиваем строку на массив и фильтруем пустые строки
        const urlsArray: string[] = templateData.urls.split('\n').filter(url => url.trim() !== '');

        const foundPromocodes = [];

        for (const fullUrl of urlsArray) {
            try {
                const urlToSearch = new URL(fullUrl).href;

                const promocodes = await db.store.findAll({
                    where: {
                        store_url: urlToSearch,
                    },
                    attributes: {
                        exclude: ['id'],
                    },
                });

                for(const code of promocodes){
                    if (code && code.dataValues.createdAt) {
                        foundPromocodes.push({
                            ...code.toJSON(),
                            description: code.dataValues.createdAt.replace(/\n|\r/g, ''),
                            createdAt: format(new Date(code.dataValues.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                            updatedAt: format(new Date(code.dataValues.updatedAt), 'yyyy-MM-dd HH:mm:ss')
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing URL ${fullUrl}:`, error);
            }
        }

        // Дождитесь завершения всех асинхронных операций, прежде чем продолжить
        await Promise.all(foundPromocodes);


        if (foundPromocodes.length == 0) {
            return res.status(400).json({res: false, data: 'Добавьте магазины в шаблон'});
        }

        // Возвращаем найденные объекты в ответе
        const jsonData = foundPromocodes.map(promocode => promocode);

        // Преобразовываем JSON в CSV
        const csvData = json2csv.parse(jsonData);

        // Создаем поток чтения из строки CSV
        const readableStream = new Readable();
        readableStream._read = function () {
            this.push(csvData);
            this.push(null); // Завершаем поток
        };

        // Устанавливаем заголовки для скачивания файла
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment;`);

        // Передаем поток в ответ
        readableStream.pipe(res);

    } catch (e) {
        console.error(e);
        res.status(500).json({res: false, error: 'Internal Server Error'});
    }
}