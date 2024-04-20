
import { Readable } from 'stream';
import db from '../../../bd';

export default async function handler(req, res) {
    try {
        // Получаем данные из базы данных
        const allStores = await db.store.findAll();

        // Создаем поток данных из полученных данных
        const readableStream = new Readable({
            read() {
                this.push(JSON.stringify(allStores));
                this.push(null); // Завершаем поток
            }
        });

        // Устанавливаем заголовки для передачи данных
        res.setHeader('Content-Type', 'application/json');

        // Передаем поток данных в ответ
        readableStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
}
