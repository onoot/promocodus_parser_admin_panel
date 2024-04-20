import rp from 'request-promise';
import htmlParser from 'node-html-parser';
import {TaskShop} from "./AddTaskShop";

export class ParserHTML {
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

    async parseStore(store_url: string) {
        try {
            const storePage = await rp.get(store_url, {
                headers: this.headers,
                gzip: true,
            });

            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Europe/Moscow',
                year: 'numeric' as const,
                month: '2-digit' as const,
                day: '2-digit' as const,
                hour: '2-digit' as const,
                minute: '2-digit' as const,
                second: '2-digit' as const,
                hour12: false, // 24-часовой формат
            };

            const time = new Date().toLocaleString('ru-RU', options);

            const store = htmlParser.parse(storePage);
            const categories = store.querySelector('.breadcrumbs').querySelectorAll('a');
            const StoreName = store.querySelector('.breadcrumbs').querySelectorAll('li');

            const storeInfo = {
                category: categories[categories.length - 1]||'',
                sub_category: categories[categories.length - 2]||'',
                store_name: StoreName[categories.length]||'',
                promo_prompt: store.querySelector('.campaign-where')||'',
                img:store.querySelector('.campaign-about-logo').querySelector('img').getAttribute('data-src')||'',
                description: store.querySelector('.c-a-descr')||'',
                h1: store.querySelector('.main-title')||'',
                h2: store.querySelector('.sub-title')||'',
                slag: store_url.replace('https://promokodus.com/campaigns/', '')||'',
                url: store.querySelector('.campaign-info a[href^="https://"]:not([href^="https://vk.com"])[target="_blank"][rel="nofollow"]')||'',
                info:  store.querySelector('.ci-subtitle')||'',
                info_vk: store.querySelector('a[href^="https://vk.com"][target="_blank"][rel="nofollow"]').getAttribute('href')||'',
                info_address: store.querySelector('.ci-subtitle:first-of-type + div')||'',
                info_email: store.querySelector('.offer-info-mail a')||'',
                info_phone: store.querySelector('a[href^="tel"]')||'' ,
                time,
                store_url: store_url,
            };


// Получение категорий
            if (categories && categories.length > 0) {
                storeInfo.category = categories[categories.length - 1].textContent.replace(/[\n\r]+/g, '');
                storeInfo.sub_category = categories[categories.length - 2].textContent.replace(/[\n\r]+/g, '');
            }

// Получение имени магазина
            if (StoreName && StoreName.length > categories.length) {
                storeInfo.store_name = StoreName[categories.length].textContent.replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, ' ');
            }

// Получение промо-приглашения
            const promoPromptElement = store.querySelector('.campaign-where');
            if (promoPromptElement) {
                storeInfo.promo_prompt = promoPromptElement.textContent.replaceAll('\n', '').trim();
            }

// Получение изображения
            const campaignAboutLogo = store.querySelector('.campaign-about-logo img');
            if (campaignAboutLogo) {
                storeInfo.img = campaignAboutLogo.getAttribute('data-src');
            }

// Получение описания
            const campaignDescription = store.querySelector('.c-a-descr');
            if (campaignDescription) {
                const description = campaignDescription.textContent.replaceAll('  ', '').replace(/\n/g, '');
                storeInfo.description = description;
            }

// Получение заголовков
            const mainTitleElement = store.querySelector('.main-title');
            if (mainTitleElement) {
                storeInfo.h1 = mainTitleElement.textContent.replaceAll('  ', '').replaceAll('\n', '');
            }

            const subTitleElement = store.querySelector('.sub-title');
            if (subTitleElement) {
                storeInfo.h2 = subTitleElement.textContent.replaceAll('  ', '').replaceAll('\n', '');
            }

// Получение URL
            const campaignInfoURL = store.querySelector('.campaign-info a[href^="https://"]:not([href^="https://vk.com"])[target="_blank"][rel="nofollow"]');
            if (campaignInfoURL) {
                storeInfo.url = campaignInfoURL.textContent;
            }

// Получение информации о ВКонтакте
            const vkLink = store.querySelector('a[href^="https://vk.com"][target="_blank"][rel="nofollow"]');
            if (vkLink) {
                storeInfo.info_vk = vkLink.getAttribute('href');
            }

// Получение адреса
            const addressElement = store.querySelector('.ci-subtitle:first-of-type + div');
            if (addressElement) {
                storeInfo.info_address = addressElement.textContent;
            }

// Получение email
            const emailElement = store.querySelector('.offer-info-mail a');
            if (emailElement) {
                storeInfo.info_email = emailElement.textContent;
            }

const campingName = store.querySelector('.ci-subtitle');
            if (campingName) {
                storeInfo.info = campingName.textContent;
            }

// Получение телефона
            const phoneLink = store.querySelector('a[href^="tel"]');
            if (phoneLink) {
                storeInfo.info_phone = phoneLink.textContent;
            }

            storeInfo.time = new Date().toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow"
            });

            storeInfo.slag = store_url.replace('https://promokodus.com/campaigns/', '');
            storeInfo.store_url = store_url;

            return storeInfo;

        } catch (err) {
            console.log('Parse store error: ' + err);
            return false;
        }
    }
}