import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import * as puppeter from 'puppeteer';

puppeteer.use(pluginStealth());

export class PromoLink {
    private link: string;
    private browser: puppeter.Browser;

    constructor(link: string, browser: puppeter.Browser) {
        this.link = link;
        this.browser = browser;
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async parse(id?): Promise<string> {
        let finalUrl = '';
        let page: puppeter.Page | undefined;

        try {
            if (!this.browser) {
                this.browser = await puppeteer.launch({
                    headless: "new",
                    ignoreHTTPSErrors: true,
                    args: ['--headless', '--no-sandbox', '--disable-infobars', '--disable-setuid-sandbox']
                    // args: ['--headless', '--no-sandbox', '--disable-infobars', '--disable-setuid-sandbox']
                });
                throw new Error('Browser is not initialized');
            }

            page = await this.browser.newPage();

            // Отменяем загрузку изображений, стилей и других ресурсов
            await page.setRequestInterception(true);
            page.on('request', interceptedRequest => {
                if (interceptedRequest.resourceType() === 'image' || interceptedRequest.resourceType() === 'stylesheet' || interceptedRequest.resourceType() === 'font') {
                    interceptedRequest.abort();
                } else {
                    interceptedRequest.continue();
                }
            });

            page.on('requestfailed', request => {
                finalUrl = request.url();
            });

            await page.goto(this.link, { waitUntil: 'load', timeout: 60000 });

            // Ждем некоторое время для возможной динамической загрузки контента
            await this.delay(4000);

            finalUrl = page.url();

            if (finalUrl === this.link) {
                console.log('Ошибка!')
            }

            return finalUrl;
        } catch (error) {
            return finalUrl;
        } finally {
            if (page) {
                await page.close();
            }
            console.log('Final URL:', finalUrl);
        }
    }
}
