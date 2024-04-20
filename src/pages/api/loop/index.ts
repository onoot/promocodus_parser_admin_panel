import cron from 'node-cron';
import db from '../bd';
import validUrl from "valid-url";
import {parser} from "../controller/modules/promo";

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

export async function loop() {
    try {
        const allTasks = await db.tasks.findAll({
            attributes: ['name', 'template']
        });

        if (allTasks.length > 0) {
            for (const task of allTasks) {

                const templateId = task.get('template');
                const template = await db.template.findByPk(templateId);

                if (template && template.dataValues.parseUrls === true) {
                    //получение name
                    const name = task.get('name')

                    const currentDate = new Date();
                    currentDate.setUTCHours(currentDate.getUTCHours() + 4);

                    const updatedAt = new Date(template.dataValues.updatedAt);

                    // Сравниваем даты
                    if (currentDate.getDate() >= updatedAt.getDate() && currentDate.getMonth() === updatedAt.getMonth() && currentDate.getFullYear() === updatedAt.getFullYear()) {

                        const templateData = template.get() as TemplateAttributes;

                        let urlsArray: string[] = templateData.urls
                            .split('\n')
                            .filter(url => url.trim() !== '' && validUrl.isUri(url));

                        let validUrlsCount: number = urlsArray.length;

                        if (validUrlsCount === 0) {
                            console.log(`Нет валидных ссылок для обработки в task с id ${task.dataValues.id}`);
                            continue;
                        }

                        // В цикле обработать все валидные URL
                        for (const url of urlsArray) {
                            try {
                                const promoData = await new parser([url], name).parse();
                                // Здесь должна быть дополнительная работа с promoData

                                // После обработки каждого URL уменьшаем счётчик
                                validUrlsCount--;

                                // Если обработаны все URL, сообщаем об этом и прерываем цикл
                                if (validUrlsCount === 0) {
                                    console.log(`Обработка всех ссылок для task с ID ${task.dataValues.id} выполнена.`);
                                    break;
                                }
                            } catch (error) {
                                console.error(`Ошибка при обработке URL ${url} в task с ID ${task.dataValues.id}:`, error);
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Ошибка в main loop:', err);
    }
}

cron.schedule('0 3 * * *', async () => {
    await loop();
}, {
    scheduled: true,
    timezone: "Europe/Moscow"
});

// Раскомментировать, если требуется тестовый запуск функции каждую секунду
// cron.schedule('* * * * * *', async () => {
//     console.log('Выполняется код каждую секунду...');
//     await loop();
// });