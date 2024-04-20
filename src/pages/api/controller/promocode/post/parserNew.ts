import rp from 'request-promise';
import htmlParser from 'node-html-parser';
import puppeteer, {Browser} from "puppeteer";
import {PromoLink} from "../../modules/promoLink";

import postPromoCode from "./postbd";
import {completed} from "./completed";
import db from "../../../bd";
import {log} from "winston";

export class ParserPromocodusHTML {
    headers: { [key: string]: string };

    constructor() {
        this.headers = {
            Accept: 'text / html, application/ xhtml + xml, application/ xml; q = 0.9, image / avif, image / webp, image / apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en,ru-RU;q=0.9,ru;q=0.8,en-US;q=0.7',
            'Cache-Control': 'no-cache',
            'Dnt': '1',
            'Pragma': 'no-cache',
            'Referer': 'https://promokodus.com/',
            'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
        }
    }

    async delay(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
    async task(id){
        try {
            const task = await db.tasks.findOne({
                where:{
                    id: id
                },
                attributes: ['run']
            });
            if(!task.get('run'))
                return false
            else{
                return true
            }
        }catch (e) {
            return false
        }
    }

    public async parseNew(store_url: string[], name: string, id: number) {
        let browser: Browser

        try {
            browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors: true,
                args: ['--no-sandbox', '--disable-infobars', '--disable-setuid-sandbox']
                // args: ['--headless', '--no-sandbox', '--disable-infobars', '--disable-setuid-sandbox']
            });

            let totalIterations = 0;
            let currentProgress = 0;



            // for (const item of store_url) {
            for (let a = 0; a < store_url.length; a++){
                let item = store_url[a];

                const storePage = await rp.get(item, {
                    headers: this.headers,
                    gzip: true,
                    resolveWithFullResponse: true
                });
                const task = await db.tasks.findOne({
                    where:{
                        template: id
                    },
                    attributes: ['run']
                });
                if (task)
                    if (task.get('run') == false)
                        return

                const finalUrl = storePage.request.uri.href;
                let store = htmlParser.parse(storePage);

                    // Сравниваем начальный и конечный URL
                if (item !== finalUrl) {
                    const storPag = await rp.get(finalUrl, {
                        headers: this.headers,
                        gzip: true,
                        resolveWithFullResponse: true
                    });
                    store = htmlParser.parse(storPag.body);
                    item=finalUrl;
                    console.log(item, finalUrl)
                } else {
                    store = htmlParser.parse(storePage.body);
                }
                const categories = store.querySelector('.breadcrumbs');

                if (!categories) {
                    console.log('No categories found on the page.');
                    continue; // Skip this store and proceed to the next one
                }

                const categoryLinks = categories.querySelectorAll('a');

                const StoreName = store.querySelector('.breadcrumbs').querySelectorAll('li');
                const store_name = StoreName[StoreName.length-1].textContent.replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, ' ')


                console.log('Магазин: ', store_name.trim());

                if(store_name.trim()=='Сайты по категориям'){
                    console.log('Ссылка не существует')
                    continue
                }
                const result = {};
                const couponsContainer = store.querySelector('.coupons-horizontal');
                if (!couponsContainer) return;

                const coupons = couponsContainer.querySelectorAll('.coupon:not(.highlighted)');
                console.log("Обнаружено купонов", coupons.length)
                for (let i = 0; i < coupons.length; i++) {

                    const task = await db.tasks.findOne({
                        where:{
                            template: id
                        },
                        attributes: ['run']
                    });
                    if (task)
                        if (task.get('run') == false)
                            return


                    totalIterations= store_url.length * coupons.length
                    currentProgress++
                    const progress = Math.floor((currentProgress / totalIterations) * 100);
                    await completed(name, progress)

                    await this.delay(5);
                    // if (!coupons[i].querySelector('.all-codes')) {
                    if (true) {
                        const slag = item.replace('https://promokodus.com/campaigns/', '')
                        const id = coupons[i].getAttribute('data-id');

                        console.log("Парсинг по ссылке: " + `https://promokodus.com/campaigns/${slag}?couponId=${id}`, Date());

                        const couponPageRow = await rp.get(`https://promokodus.com/campaigns/${slag}?couponId=${id}`, {
                            headers: this.headers,
                            gzip: true,
                        });
                        const couponPage = htmlParser.parse(couponPageRow);

                        let coupon;

                        if (couponPage.querySelector('.cm-go-to')) {
                            let species = 'promocode';
                            let description = couponPage.querySelector('.cm-descr-warp').querySelector('.cm-descr').textContent.replace('\n', '');
                            description = description.substring(0, description.indexOf('\n')).trim();

                            const links = couponPage.querySelector('.cm-go-to').querySelectorAll('a');
                            const link = `https://promokodus.com/go/${id}`;

                            const coupon_link = await new PromoLink(link, browser).parse(id);
                            const name = coupons[i].querySelector('.text-wrap').querySelector('a').textContent;
                            const times = couponPage.querySelectorAll('.time');
                            coupon = {
                                name: name.trim(),
                                description,
                                coupon_id: id,
                                species: couponPage.querySelector('.cm-code-wrap') ? 'promocode' : 'action',
                                promocode: couponPage.querySelector('.cm-code-wrap') ? couponPage.querySelector('.cm-code-wrap').querySelector('input').getAttribute('value') : '',
                                store_name,
                                store_url: item,
                                coupon_link,
                                date_end: times[times.length - 1].textContent.replaceAll('\n', '').trim().replace('Действителен до ', ''),
                            };
                        }else{
                            console.log('Не удалось получить купон')
                        }
                        if (coupon) {
                            result[coupons[i].getAttribute('data-id')] = {...coupon};
                        }
                    }
                }
                console.log('Сохранение в базу')
                await postPromoCode(Object.values(result))
            }
            await completed(name, 100)
            return true;
        } catch (e) {
            console.log('Ошибка при парсинге купонов ' ,e)
            throw e
        }finally {
            browser?browser.close():''
        }
    }
}