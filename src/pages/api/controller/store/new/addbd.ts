// Импортируем необходимые модели из вашего файла bd/index
import db from '../../../bd';

export async function saveStore(storeData) {
    try {

        if (storeData) {

            // Спарсенные данные получены успешно, теперь сохраним их в базу данных
            for (const store of storeData) {

                const {store_url} = store;

                // Ищем магазин по URL в базе данных
                const existingStore = await db.store.findOne({
                    where: {
                        store_url: store_url,
                    },
                });


                if (existingStore) {
                    // Если магазин уже существует, обновляем его данные
                    await existingStore.update({
                        store_url: store_url,
                        store_name: store.store_name,
                        active: true,
                        category: store.category,
                        sub_category: store.sub_category,
                        url: store.url,
                        h1: store.h1,
                        h2:  store.h2,
                        img: store.img,
                        info: store.info,
                        info_addres: store.info_address,
                        info_email: store.info_email,
                        info_phone: store.info_phone,
                        info_vk: store.info_vk,
                        slag: store.slag,
                        description:  store.description,
                        time: store.time,
                        new: true,
                    });
                } else {
                    // Если магазина нет, создаем новый
                    await db.store.create({
                        store_url: store_url,
                        store_name: store.store_name,
                        active: true,
                        category: store.category,
                        sub_category: store.sub_category,
                        url: store.url,
                        h1: store.h1,
                        h2:  store.h2,
                        img: store.img,
                        info: store.info,
                        info_addres: store.info_address,
                        info_email: store.info_email,
                        info_phone: store.info_phone,
                        info_vk: store.info_vk,
                        slag: store.slag,
                        description:  store.description,
                        time: store.time,
                        new: true,
                    });
                }
            }
        }
    } catch (err) {
        console.error("Ошибка при сохранении в БД: ", err);
    }
}
