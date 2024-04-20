import db from '../../../bd';


export class TaskShop {
    async add(id, run) {
        try {
            console.log('Изменение статуса задачи')
            const existingTemplate = await db.shoptask.findOne({
                where: {
                    id: id,
                },
            });
            if (existingTemplate) {
                await existingTemplate.update({
                    run: run,
                    lastRun: Date()
                });
            }else{
                await db.shoptask.create({
                    template: 'Все магазины',
                    run: run
                });
            }

        } catch (e) {
            console.log(e)
            return e
        }
    }

    async set(type, run) {
        try {
            const NewTest = await db.shoptask.create({
                template: type ? 'Все магазины' : 'Выбранные магазины',
                run: run
            })
            return NewTest.dataValues.id
        } catch (e) {
            console.log(e)
            return e
        }
    }

    async get(id?) {
        try {
            const {dataValues} = await db.shoptask.findOne({
                where: {
                    id: id,
                },
            });


            return dataValues

        } catch (e) {
            console.log(e)
            return e
        }
    }
    async getAll() {
        try {
            return await db.shoptask.findAll()
        } catch (e) {
            console.log(e)
            return e
        }
    }
}