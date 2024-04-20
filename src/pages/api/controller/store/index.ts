import type {NextApiRequest, NextApiResponse} from 'next';
import {getStore} from "../modules/gerStore";
import {saveStore} from "./addbd";
import db from "../../bd";
import postHistory from "../history/post";
import {ParserHTML} from "../modules/1";

import {TaskShop} from "../modules/AddTaskShop/"
import {setProgress} from "./completed";

interface Store {
    store_url: string;
    store_name: string;
    category: string;
    sub_category: string;
    url: string;
    h1: string;
    h2: string;
    info: string;
    img: string;
    time: string;
    slag: string;
    description: string;
}
const moscowTime = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    timeStyle: 'medium',
    dateStyle: 'medium',
}).format(new Date());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await new TaskShop().add(1, true)

        const bool = await new TaskShop().get(1)

        // if (bool.run === true) {
        //     res.status(400).json({res: true, message: 'Функция уже запущена'});
        //     console.log("Функция уже запущена")
        //     return;
        // }

        const storeLinks = await getUniqueStoreLinks()
        let storesData: Store[] = [];

        await postHistory({
            name: 'Парсинг всех магазинов',
            lastRun: moscowTime,
            type: 'parsing_all_shop',
            urls: '',
            parseUrls: false,
        });

        if(storeLinks.length<=0){
            console.log('Получен блок от сайта. Ошибка 403')
            await new TaskShop().add(1, false)
        }else{
            console.log(" из ", storeLinks.length)
            console.log('Переход к парсингу ссылок на магазины')
        }

        for (let i = 0; i < storeLinks.length; i++) {
            console.log(i||1, " из ", storeLinks.length)
            const total = Math.floor((i / storeLinks.length) * 100);

            await setProgress(1,total)
            const storeLink = storeLinks[i];
            await new Promise(resolve => setTimeout(resolve, 1000));

            const bool = await new TaskShop().get(1)

            if(!bool.run)
                return false
            // const storeData = await parseStoreData(browser, storeLink.url);
            const storeData = await new ParserHTML().parseStore(storeLink.url);

            if (storeData) {
                // @ts-ignore
                storesData.push(storeData);
                if (storesData.length === 10 || i === storeLinks.length - 1) {
                    await saveStore(storesData);
                    storesData = [];
                    if (i < storeLinks.length - 1) {
                        // Добавляем задержку в 1 секунду перед продолжением цикла
                    }
                }
            }else{
                res.status(400).json({res: true, message: 'Задача остановлена'});
                return
            }
        }

        if (storesData.length > 0) {
            await saveStore(storesData);
        }
        res.status(200).json({res: true, message: 'Data processed successfully'});
    } catch (error) {
        await new TaskShop().add(1, false)
        console.error('Parsing error:', error);
        res.status(500).json({error: 'Parsing error'});
        await postHistory({
            name: 'Парсинг всех магазинов',
            lastRun: moscowTime,
            type: 'error_parsing_all_shop',
            urls: '',
            parseUrls: false,
        });

    } finally {
        await new TaskShop().add(1, false)
        // if (browser) {
        //     // await browser.close();
        // }
        await postHistory({
            name: 'Парсинг всех магазинов',
            lastRun: moscowTime,
            type: 'ok_parsing_all_shop',
            urls: '',
            parseUrls: false,
        });

    }
}

async function getUniqueStoreLinks() {
    const date = await new getStore().parse();
    const storeUrls = date.map(url => url.url);

    const existingStores = await db.store.findAll({
        where: {
            store_url: storeUrls,
        },
        attributes: ['store_url', 'new', 'description'],
    });

    // Преобразуем результат в объект для удобного доступа
    const existingStoresMap = existingStores.reduce((map, store) => {
        map[store.store_url] = store.new;
        return map;
    }, {});

    // Фильтруем URL, которые ещё не существуют в базе данных, или cуществуют с полем new === true
    //const storeLinks = date.filter(url => !existingStoresMap[url.url] || existingStoresMap[url.url] === true);
    const storeLinks = date.filter(url => !existingStoresMap[url.url]||!existingStoresMap[url.description]);

    return storeLinks;
}
