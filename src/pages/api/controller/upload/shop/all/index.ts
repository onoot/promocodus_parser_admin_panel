import db from '../../../../bd';
import json2csv from 'json2csv';
import {Readable} from 'stream';
import {format} from "date-fns";

export default async function handler(req, res) {
    try {
        let promocodes=[];

        const promocode = await db.store.findAll({
            attributes: {
                exclude: ['id']
            }
        });
        for(const code of promocode){
            if (code && code.dataValues.createdAt) {
                promocodes.push({
                    ...code.toJSON(),
                    description: code.dataValues.createdAt.replace(/\n|\r/g, ''),
                    createdAt: format(new Date(code.dataValues.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                    updatedAt: format(new Date(code.dataValues.updatedAt), 'yyyy-MM-dd HH:mm:ss')
                });
            }
        }

        // Если массив найденных промокодов пуст, вернуть сообщение
        if (promocodes.length === 0) {
            return res.status(400).json({res: false, data: 'Магазины отсутствуют в базе'});
        }

        console.log('Найдены')

        // Возвращаем найденные объекты в ответе
        const jsonData = promocodes.map(item => item.toJSON());

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