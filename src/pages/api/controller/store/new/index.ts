import puppeteer, {Browser} from 'puppeteer';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getStore} from "../../modules/gerStore";
import {saveStore} from "./addbd";
import db from "../../../bd";
import postHistory from "../../history/post";
import {ParserHTML} from "../../modules/1";
import {index} from "cheerio/lib/api/traversing";
import {TaskShop} from "../../modules/AddTaskShop";


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

async function parseStoreData(browser: Browser, url: string): Promise<Store> {
    const page = await browser.newPage();


    try {
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        await page.setExtraHTTPHeaders({
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'cache-control': 'max-age=0',
            'cookie': 'prov=4568ad3a-2c02-1686-b062-b26204fd5a6a; usr=p=%5b10%7c15%5d%5b160%7c%3bNewest%3b%5d',
            'referer': 'https://promokodus.com/',
            'accept-language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-site': 'cross-site',
            'upgrade-insecure-requests': '1',
        });

        // Очистить куки
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        // Очистить кеш страницы
        await page.evaluate(() => {
            try {
                return caches.keys().then(function (names) {
                    for (let name of names) caches.delete(name);
                });
            } catch (e) {
            }

        });


        //await page.setRequestInterception(true);
        //await page.goto(url, { waitUntil: 'domcontentloaded' });
        page.on('response', async (response) => {
            if (response.status() >= 400 && response.status() < 500) {
                // Обработка ошибок клиента (4xx)
                console.log(`Ошибdsdsdsdка: ${response.status()} ${response.statusText()}`)
                // Дополнительные действия по обработке ошибки
                return null;
            }
        });


        await page.goto(url, {waitUntil: 'load'});

        // Ожидание появления компонента jquery-modal blocker current с максимальным временем ожидания 10 секунд
        const modalSelector = '.jquery-modal.blocker.current';
        const modalTimeout = 10000; // Время ожидания в миллисекундах (10 секунд)
        let isModalVisible = false;

        try {
            await page.waitForSelector(modalSelector, {timeout: modalTimeout});
            isModalVisible = true;
        } catch (error) {
            console.log('Компонент jquery-modal blocker current не появился в течение 10 секунд.');
        }

        // Если компонент видимый, нажимаем на кнопку с id confirm-button
        if (isModalVisible) {
            // Проверяем, отмечен ли чекбокс robot-checkbox
            const isCheckboxChecked = await page.evaluate(() => {
                const checkbox = document.querySelector<HTMLInputElement>('#robot-checkbox');
                return checkbox ? checkbox.checked : false;
            });

            // Если чекбокс не отмечен, отмечаем его
            if (!isCheckboxChecked) {
                await page.click('#robot-checkbox');
            }

            // Нажимаем на кнопку confirm-button
            await page.click('#confirm-button');
        }


        const promocodeData: Store = await page.evaluate(() => {
            const getTextContent = (selector: string): string => {
                return document.querySelector(selector)?.textContent?.trim() || '';
            };

            const getAttribute = (selector: string, attr: string): string => {
                return document.querySelector(selector)?.getAttribute(attr) || '';
            };

            // Получаем название магазина, категорию и подкатегорию
            const breadcrumbs = [...document.querySelectorAll('.breadcrumbs li')].reverse();
            let store_name = '';
            let category = '';
            let sub_category = '';

            if (breadcrumbs.length > 0) {
                const storeElement = breadcrumbs[0].querySelector('span');
                store_name = storeElement ? storeElement.textContent.trim() : '';
            }

            if (breadcrumbs.length > 1) {
                const subCategoryElement = breadcrumbs[1].querySelector('a');
                sub_category = subCategoryElement ? subCategoryElement.textContent.trim() : '';
            }

            if (breadcrumbs.length > 2) {
                const categoryElement = breadcrumbs[2].querySelector('a');
                category = categoryElement ? categoryElement.textContent.trim() : '';
            }

            // Остальная логика извлечения данных
            const h1 = getTextContent('.main-title');
            const h2 = getTextContent('.sub-title');
            const description: string = document.querySelector('.c-a-descr')?.textContent?.trim() || '';

            const info = getTextContent('.ci-subtitle:first-of-type');
            const info_address = getTextContent('.ci-subtitle:first-of-type + div');
            const info_email = getTextContent('.offer-info-mail a');
            const info_phone = getTextContent('a[href^="tel"]');

            const info_vk = document.querySelector('a[href^="https://vk.com"][target="_blank"][rel="nofollow"]').getAttribute('href');

            //const url2: string = document.querySelector('a[href^="https://"][target="_blank"][rel="nofollow"]').getAttribute('href');
            const url2: string = document.querySelector('.campaign-info a[href^="https://"]:not([href^="https://vk.com"])[target="_blank"][rel="nofollow"]').textContent || 'Ошибка';

            const img = getAttribute('.lazy', 'src');


            const store_url = 'https://promokodus.com' + window.location.pathname;


            // Вытаскиваем slug из URL, предполагается, что это последняя часть пути URL
            const urlParts = window.location.pathname.split('/');
            const slag = encodeURIComponent(urlParts[urlParts.length - 1]);

            //const store_url = 'https://promokodus.com/campaigns/' + slag;

            const time = new Date().toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow"
            });

            return {
                store_url,
                store_name,
                category,
                sub_category,
                url: url2,
                h1,
                h2,
                info,
                info_address,
                info_email,
                info_phone,
                info_vk,
                img,
                time,
                slag,
                description,
            };
        });

        return promocodeData;
    } catch (error) {
        console.error(error);
    } finally {
        await page.close();
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {items} = req.body;

    let id_task
    if (!items) {
        res.status(400).json({res: false, message: 'Запрос неверный'});
        console.log('Неверный запрос')
        return
    }

    try {

        let storeLinks = [];

        for (const item of items) {
            const storeLinkData = await db.store.findOne({
                where: {
                    id: item,
                },
                attributes: ['store_url'],
            });

            if (storeLinkData) {
                storeLinks.push(storeLinkData.get('store_url'));
            }
        }


        let storesData: Store[] = [];

        const urlsAsString = JSON.stringify(storeLinks);

        await postHistory({
            name: 'Парсинг выбранных магазинов',
            lastRun: moscowTime,
            type: 'parsing_select_shop',
            urls: urlsAsString,
            parseUrls: false,
        });
        // const id = await new TaskShop().set(true, true)
        for (const storeLink of storeLinks) {

            console.log(`Выделенный магазин: `, storeLinks.indexOf(storeLink) + 1, ` из `, storeLinks.length);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const storeData = await new ParserHTML().parseStore(storeLink);
            if (storeData) {
                // @ts-ignore
                storesData.push(storeData);
                if (storesData.length === 50) {
                    await saveStore(storesData);
                    storesData = [];
                }
            } else if (storeData === null) {
                res.status(500).json({error: '403'});
            }
        }
        if (storesData.length > 0) {
            await saveStore(storesData);
        }
        res.status(200).json({message: storesData});

    } catch (error) {
        console.error('Parsing error:', error);
        res.status(500).json({error: 'Parsing error'});
        await postHistory({
            name: 'Парсинг выбранных магазинов',
            lastRun: moscowTime,
            type: 'error_parsing_select_shop',
            urls: '',
            parseUrls: false,
        });
    } finally {
        await new TaskShop().add(id_task, false)
    }
}