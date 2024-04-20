import puppeteer from 'puppeteer';
import {parseCode} from "./getCode";
import {parseDes} from "./getDes";
import postPromoCode from "../promocode/post/postbd";
import {completed} from "../promocode/post/completed";
import {PromoLink} from "./promoLink";

interface Promocode {
    coupon_id: string,
    category: string;
    name: string;
    sub_category: string;
    img: string;
    description: string;
    //coupling: Promise<string>;
    coupling: string;
    h1: string;
    h2: string;
    info: string;
    date_end: string;
    slag: string;
    url: string;
}

//
// function delay(duration: number) {
//     return new Promise(resolve => setTimeout(resolve, duration));
// }

export class parser {
    private urls: string[];
    private nam: string;

    constructor(urls: string[], name: string) {
        this.urls = urls;
        this.nam = name;
    }

    public async parse(): Promise<Promocode[] | null> {
        const browser = await puppeteer.launch({
            headless: 'new',
            //headless: false,
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const companiesData: Promocode[] = [];


            const urls = this.urls;

            const totalUrls = urls.length;

            const percentPerUrl = 100 / totalUrls;

            let percentRemaining = 0;

            await completed(this.nam, 0)

            for (const url of this.urls) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                console.log('[32mСсылка: [39m', url)
                const page = await browser.newPage();
                await page.setExtraHTTPHeaders({
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "ru,en;q=0.9",
                    "Cache-Control": "max-age=0",
                    "Cookie": "_ym_uid=1702149550340031808; _ym_d=1702485008; geolocate=ru; lead-generator-modal=show; _ga=GA1.1.983009842.1702485008; XSRF-TOKEN=eyJpdiI6ImlvcVZLVzRZK0dDRlVXeDN6Mnl2VGc9PSIsInZhbHVlIjoiQ1ZxZHNUTGN4anRPQ3U5Mm5iYVlYUFo4dnZYQzd3NFEyMlhmc0RvdWRvSnVJV0NtSCtNNFVtWitzcTR1R2pJWm9BYVJ6T05JSlpNVll1VW4vdUgzc3VCS01JRmZtNUFOb1lyUWVBR29GeE5NemthblZNUnVzcUJVUlhyK1BOL2siLCJtYWMiOiJmOWI3NTQ2MGZkYTZlOWZlNDgzNTIxMzM4MGI3OTc1ZGRlMGQwZmJhNTQwOWEyYzJiMGVjOWRmMjVkZTZkYzIyIiwidGFnIjoiIn0%3D; core_session=eyJpdiI6ImU4RWR3MHdrYUFjT3A4Q05BdG4wN0E9PSIsInZhbHVlIjoibHVTTDFZdktSRFVheWlsVmMvSUhDaXNwWkpJVzVVSDNML0xobE9qN0JQOTJRTUJtSVJ5QzZ3TE4weURqZmNQb0czZ05rSk1VRWY2UE1aVmFlSTVsMHZackZJWUk4Yzc4ZzRSc3piYnpneHlFdGxId2JoYlFhOVFJYWh0cWNDNisiLCJtYWMiOiJlZDhkZjZhMWEyYzM5YTg1YzA0NDQ0YzE4NGQ5YWU5MzU2ZWZhY2U3MmUzNzY0ZDg0ZTcxMzM0OGE0MzQ0MzQwIiwidGFnIjoiIn0%3D; _ym_isad=1; _ga_V3555EPXS2=GS1.1.1706925604.74.0.1706925604.60.0.0",
                    'referer': 'https://promokodus.com/',
                    "Sec-Ch-Ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"YaBrowser\";v=\"24.1\", \"Yowser\";v=\"2.5\"",
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": "\"Windows\"",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36"
                });


                percentRemaining += percentPerUrl
                await completed(this.nam, Math.round(percentRemaining / 2));

                await page.goto(url, {waitUntil: 'load'});

                // Ожидание появления компонента jquery-modal blocker current с максимальным временем ожидания 10 секунд
                const modalSelector = '.jquery-modal.blocker.current';
                const modalTimeout = 10000; // Время ожидания в миллисекундах (10 секунд)
                let isModalVisible = false;

                try {
                    await page.waitForSelector(modalSelector, { timeout: modalTimeout });
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

                // Ожидание загрузки карточек
                await page.waitForSelector('.coupon-horizontal');

                // Получение данных из карточек
                const cardData = await page.evaluate(() => {
                    //const cards = Array.from(document.querySelectorAll('.coupon-horizontal:not(.highlighted)'));

                    const cards = Array.from(document.querySelectorAll('.coupons-tabs-wrap > .coupons-horizontal > .coupon:not(.coupon-cross)'))
                        .filter(cards => !cards.querySelector('a.all-codes-mob'));

                    return Promise.all(cards.map(async card => {

                        const fullText = card.querySelector('time')?.textContent?.trim() || '';
                        const dateMatch = fullText.match(/\d{2}\.\d{2}\.\d{4}/); // ищем дату в формате ДД.ММ.ГГГГ
                        const date = dateMatch ? dateMatch[0] : '';

                        const promoPrompt = card.querySelector('.text-wrap a.title')?.textContent?.trim() || '';

                        // Получение ссылки из кнопки
                        const couplingLink = card.querySelector('.ch-inner-withbtn a')?.getAttribute('href') || ''

                        // Получение значения атрибута data-id
                        const dataId = card.querySelector('.ch-inner-withbtn a')?.getAttribute('data-id') || '';
                        //const dataNum: number = parseInt(dataId) || 0

                        // Получение класса тега <i> внутри .ch-right-content
                        const iconClass = card.querySelector('.ch-right-content i')?.getAttribute('class') || '';

                        const slag = iconClass === 'icon-Ticket' ? 'action' : iconClass === 'icon-View' ? 'promocode' : '';
                        return {
                            date,
                            name: promoPrompt,
                            slag,
                            dataId,
                            coupling: couplingLink,
                        };
                    }));
                });

                // Получение данных из элемента с классом breadcrumbs
                const breadcrumbs = await page.evaluate(() => {
                    const breadcrumbElements = Array.from(document.querySelectorAll('.breadcrumbs li span'));
                    return breadcrumbElements.map(breadcrumb => breadcrumb.textContent?.trim());
                });

                const h2 = await page.evaluate(() => {
                    const h2Elements = Array.from(document.querySelectorAll('.main-title'));
                    return h2Elements.map(element => element.textContent?.trim() || '').join(', ');
                });

                // Получение ссылки на изображение
                const imgElement = await page.$('.logo-wrap img');
                const img = imgElement ? await imgElement.evaluate(node => node.getAttribute('src')) || '' : '';

                // Проверка наличия категории и подкатегории
                const category = breadcrumbs.length >= 1 ? breadcrumbs[breadcrumbs.length - 1] : '';
                const subCategory = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : '';

                // const Time = getDateInTimeZone('Europe/Moscow');

                let coup_URL: string
                // let IDdata: string
                // let name_data: string

                const parsedData = await Promise.all(cardData.map(async data => {
                    if (!data) return null;

                    const {coupling, slag, dataId, name} = data;

                    const promoData = slag === 'promocode' ? await new parseCode(dataId, slag).parse() : '';
                    const description = await new parseDes(dataId, category).parse();

                    coup_URL=coupling
                    // IDdata=dataId

                    const isString = typeof description === 'string';

                    const clearDes = isString ? description.replace(/ Подробнее$/, '') : description;

                    const coup = await new PromoLink(coupling, browser).parse();

                    console.log(`[32mДанные для купона[39m "${dataId}" [32mполучены[39m`);
                    return {
                        name,
                        coupon_id: dataId,
                        category,
                        sub_category: subCategory,
                        img,
                        h1: '',
                        h2,
                        info: '',
                        slag,
                        url,
                        coupling: coup,
                        promocode: promoData,
                        description: clearDes,
                        date_end: data.date,
                        data_id: data.dataId,
                    };
                }));

                companiesData.push(...parsedData.filter(Boolean));

                await postPromoCode(companiesData)
                await page.close();
                await completed(this.nam, Math.round(percentRemaining));
            }
            return companiesData;
        } catch (error) {
            console.log('Ошибка при парсинге', error)
            return null;
        } finally {
            await browser.close();
            console.log('Final')
        }
    }

}
