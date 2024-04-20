import db from '../../../bd';
import json2csv from 'json2csv';
import { Readable } from 'stream';
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
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ res: false, error: 'Missing ID parameter' });
        }

        // Ищем template по Имени в базе данных
        const template = await db.template.findByPk(id);

        if (!template) {
            return res.status(404).json({ res: false, error: 'Template not found' });
        }

        const templateData = template.get() as TemplateAttributes;

        // Разбиваем строку на массив и фильтруем пустые строки
        const urlsArray: string[] = templateData.urls.split('\n').filter(url => url.trim() !== '');

        const foundPromocodes = [];

        // Перебираем каждый URL и ищем соответствующие промокоды
        for (const fullUrl of urlsArray) {
            const urlObj = new URL(fullUrl);
            const urlToSearch = urlObj.origin + urlObj.pathname;

            const promocode = await db.prmocode.findAll({
                where: {
                    store_url: `${urlToSearch}`,
                },
                attributes: {
                    exclude: ['id', 'data_id', 'status_code']
                }
            });

            for(const code of promocode){
                if (code && code.dataValues.createdAt) {
                    foundPromocodes.push({
                        ...code.toJSON(),
                        createdAt: format(new Date(code.dataValues.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                        updatedAt: format(new Date(code.dataValues.updatedAt), 'yyyy-MM-dd HH:mm:ss')
                    });
                }
            }
        }

        // Если массив найденных промокодов пуст, вернуть сообщение
        if (foundPromocodes.length === 0) {
            return res.status(400).json({ res: false, data: 'Промокоды не найдены для указанных URL' });
        }

        // Возвращаем найденные объекты в ответе
        const jsonData = foundPromocodes.map(promocode => promocode);

        // Преобразовываем JSON в CSV
        const csvData = json2csv.parse(jsonData);

        const fileName = `files/promocode.csv`;

        // Создаем поток чтения из строки CSV
        const readableStream = new Readable();
        readableStream._read = function () {
            this.push(csvData);
            this.push(null); // Завершаем поток
        };

        // Устанавливаем заголовки для скачивания файла
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Передаем поток в ответ
        readableStream.pipe(res);

    } catch (e) {
        console.error(e);
        res.status(500).json({ res: false, error: 'Internal Server Error' });
    }
}