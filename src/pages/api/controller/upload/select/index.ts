import db from '../../../bd';
import json2csv from 'json2csv';
import {Readable} from 'stream';
import {format} from "date-fns";


export default async function handler(req, res) {
    try {
        const {id, rout} = req.body.data;

        if (!id) {
            return res.status(400).json({res: false, error: 'Missing ID parameter '});
        }

        let search=[];

        switch (rout) {
            case 1:
                // Ищем по id в базе данных
                for(const item of id){
                    const code = await db.prmocode.findByPk(item,{
                        attributes: {
                            exclude: ['id', 'data_id', 'status_code']
                        }
                    });
                    search.push(code)
                }
                break
            case 2:
                // Ищем по id в базе данных
                for(const item of id) {
                    const code = await db.store.findByPk(item,{
                        attributes: {
                            exclude: ['id']
                        }
                    });
                    search.push(code)
                }
                break
        }


        if (search.length<=0) {
            return res.status(404).json({res: false, error: 'Search not found'});
        }

        const foundPromocodes = [];


        for (const code of search) {
            if (code && code.dataValues.createdAt) {
                foundPromocodes.push({
                    ...code.toJSON(),
                    createdAt: format(new Date(code.dataValues.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                    updatedAt: format(new Date(code.dataValues.updatedAt), 'yyyy-MM-dd HH:mm:ss')
                });
            }
        }


        // Если массив найденных промокодов пуст, вернуть сообщение
        if (foundPromocodes.length === 0) {
            return res.status(400).json({res: false, data: 'Промокоды не найдены для указанных URL'});
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
        res.status(500).json({res: false, error: 'Internal Server Error'});
    }
}