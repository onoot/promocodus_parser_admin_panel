// Импортируем необходимые модели из вашего файла bd/index
import db from '../../../bd';
import {getStore} from '../../modules/gerStore';

export default async function endPoint(req, res) {
    try {
        const storeData = await new getStore().parse();

        if (storeData) {
            // Спарсенные данные получены успешно, теперь сохраним их в базу данных
            for (const store of storeData) {
                // Ищем магазин по URL в базе данных
                const existingStore = await db.store.findOne({
                    where: {
                        store_url: store.url,
                    },
                });

                if (existingStore) {
                    // Если магазин уже существует, обновляем его данные
                    // await existingStore.update({
                    //     new: true,
                    // });
                } else {
                    // Если магазина нет, создаем новый
                    await db.store.create({
                        store_url: store.url,
                        active: true,
                        url: store.url,
                        slag: store.slag,
                        new: true,
                    });
                }
            }

            res.json({
                res: true,
                data: storeData,
            });
        } else {
            res.json({
                res: false,
                error: 'Failed to parse data.',
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
