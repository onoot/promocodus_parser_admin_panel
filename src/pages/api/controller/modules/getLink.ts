import axios, {AxiosError} from "axios";
import {PromoLink} from "./promoLink";
import {Browser} from "puppeteer";

export class parseLink {
    private link: string;
    private browser: Browser;
    private maxRetries: number = 5;

    constructor(link: string, browser: Browser) {
        this.link=link
        this.browser=browser
    }

    public async parse(): Promise<string> {
        let response;

        for(let attempt = 0; attempt < this.maxRetries; attempt++) {
            let flink: string;
            let finalUrl:string;

            try {
                response = await axios.get(this.link, {
                    maxRedirects: 10,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 YaBrowser/23.11.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Sec-Fetch-Mode': 'cors',
                    },
                });

                // Использование финального URL (после всех редиректов)
                //const finalUrl = response.config.url
                finalUrl = response.request.res.responseUrl || response.request._redirectable._currentUrl;


                const match = finalUrl.startsWith('https://promokodus.com');
                const matchCondition = finalUrl.startsWith('https://go.redav.online');

                if (matchCondition||finalUrl!==null) {
                    flink =  await new PromoLink(finalUrl, this.browser).parse()
                }else{
                    flink = finalUrl
                }
                return flink;

            } catch (error) {
                const axiosError = error as AxiosError;

                // ...
                if (axiosError.response?.status === 429) {
                    console.error(`Retry attempt ${attempt + 1}:`, error);

                    let retryAfter = axiosError.response.headers['retry-after'];
                    if (retryAfter) {
                        retryAfter = parseInt(retryAfter, 10000);
                        if (!isNaN(retryAfter)) {
                            retryAfter *= 20; // Конвертировать секунды в миллисекунды
                        } else {
                            const dateRetryAfter = new Date(retryAfter);
                            if (!isNaN(dateRetryAfter.getTime())) {
                                retryAfter = dateRetryAfter.getTime() - Date.now();
                            } else {
                                continue; // Если формат заголовка `retry-after` неверен, пропустить ожидание
                            }
                        }
                    } else {
                        // Применяем экспоненциальную задержку, если нет заголовка `retry-after`
                        retryAfter = Math.pow(2, attempt) * 1000; // 2, 4, 8 секунды и т. д.
                    }
                    console.log(`Waiting for ${retryAfter} ms before next retry`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter));
                }else {
                    console.error('Parsing error:', error);
                    flink =  await new PromoLink(this.link, this.browser).parse()
                    return flink;
                }
            }
        }

        console.error('Max retries reached. Giving up.');
        return null;
    }
}