import db from '../../../../bd';

export default async function postPromoCode(dataArray) {
    try {
        if (dataArray && Array.isArray(dataArray)) {
            for (const data of dataArray) {
                // Ищем prmocode по URL в базе данных
                const existingPromocode = await db.prmocode.findOne({
                    where: {
                        coupon_id: data.coupon_id,
                    },
                });

                if (existingPromocode) {
                    // Если promocode уже существует, обновляем его данные
                    await existingPromocode.update({
                        name: data.name,
                        coupon_id: data.coupon_id,
                        coupon_link: data.coupon_link,
                        species: data.species,
                        promocode: data.promocode,
                        store_url: data.store_url,
                        store_name: data.store_name,
                        new: false,
                        deleted: false,
                        description: data.description,
                    });
                } else {
                    // Если prmocode нет, создаем новый
                    await db.prmocode.create({
                        name: data.name,
                        coupon_id: data.coupon_id,
                        coupon_link: data.coupon_link,
                        store_url: data.store_url,
                        species: data.species,
                        promocode: data.promocode,
                        store_name: data.store_name,
                        date_end: data.date_end,
                        new: true,
                        deleted: false,
                        description: data.description,
                    });
                }
            }

            return {
                res: true,
                data: dataArray,
            };
        } else {
            return {
                res: false,
                error: 'Failed to parse data.',
            };
        }
    } catch (err) {
        console.error(err);
        return {
            res: false,
            error: 'Internal Server Error',
        };
    }
}
