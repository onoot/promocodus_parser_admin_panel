// Импортируем необходимые модели из вашего файла bd/index
import db from '../../../bd';

export async function saveStore(storeData) {
    try {

        if (storeData) {

            const interval = Math.ceil(storeData.length / 4);
            // Спарсенные данные получены успешно, теперь сохраним их в базу данных
            for (const store of storeData) {
               const i = storeData.indexOf(store);

               if(i===0)
                   console.log('Сохранение новых магазинов в базу данных')
                // Определение интервалов
                if (i === 0 || i === interval || i === interval * 2 || i === interval * 3) {
                    const intervalNumber = Math.ceil((i + 1) / interval);
                    console.log(`Этап сохранения: ${intervalNumber}/4:`);
                }


                if (storeData.indexOf(store)===0)
                    console.log('Запущено сохранение данных о новых магазинах');

                // Ищем магазин по URL в базе данных
                const existingStore = await db.store.findOne({
                    where: {
                        store_url: store.url,
                    },
                });
                const {url} = store

                if (existingStore) {
                    // Если магазин уже существует, обновляем его данные
                    await existingStore.update({
                        store_url: url,
                        slag: store.slag,
                    });
                } else {
                    // Если магазина нет, создаем новый
                    await db.store.create({
                        store_url: url,
                        store_name: store.slag,
                        active: true,
                        category: store.category||'',
                        sub_category: store.sub_category||'',
                        url: store.url||'',
                        h1: '',
                        h2:  '',
                        img: store.img||'',
                        info: store.info||'',
                        info_addres: store.info_address||'',
                        info_email: store.info_email||'',
                        info_phone: store.info_phone||'',
                        info_vk: store.info_vk||'',
                        slag: store.slag||'',
                        description:  store.description||'',
                        time: store.time,
                        new: true,
                    });
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}
