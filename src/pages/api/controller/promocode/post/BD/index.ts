import db from '../../../../bd';

export default async function postPromoCod(dataArray) {
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
                        coupon_link: data.coupling,
                        description: data.description,
                        new: true,
                        deleted: false,
                    });
                }else{
                    await existingPromocode.create({
                        coupon_id: data.coupon_id,
                        coupon_link: data.coupling,
                        description: data.description,
                        new: true,
                        deleted: false,
                    });
                    console.log("Делывается")
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
