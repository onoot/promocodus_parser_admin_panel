import puppeteer from 'puppeteer';

interface Store {
    description: string;
    slag: string;
    url: string;
}

export class getStore {
    public async parse(): Promise<Store[] | null> {
        const browser = await puppeteer.launch({
            headless: 'new',
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--disable-infobars', '--disable-setuid-sandbox']
        });

        try {
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
            await page.goto('https://promokodus.com/sitemap_promokodus_ru.xml', {waitUntil: 'load'});

            console.log('Ожидание капчи')
            // Ожидание появления компонента jquery-modal blocker current с максимальным временем ожидания 10 секунд
            const modalSelector = '.jquery-modal.blocker.current';
            const modalTimeout = 5000; // Время ожидания в миллисекундах (10 секунд)
            let isModalVisible = false;

            try {
                await page.waitForSelector(modalSelector, {timeout: modalTimeout});
                isModalVisible = true;
                console.log('Капча пройдена');
            } catch (error) {
                console.log('Капча не обнаружена');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
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
            await new Promise(resolve => setTimeout(resolve, 0));
            const companiesData: Store[] = await page.evaluate(() => {
                const allUrls = Array.from(document.querySelectorAll('loc'));
                const companies: Store[] = [];


                allUrls.forEach((urlElement) => {
                    const url = urlElement.textContent?.trim();

                    // Вытаскиваем slug из URL, предполагается, что это последняя часть пути URL
                    const urlParts = url.split('/');
                    const slag = encodeURIComponent(urlParts[urlParts.length - 1]);

                    if (url?.includes("https://promokodus.com/campaigns/")) {
                        companies.push({
                            slag: slag,
                            description: '',
                            url: url,
                        });
                    }
                });
                return companies;
            });

            console.log('Найдено магазинов: ', companiesData.length)

            return companiesData;
        } catch (error) {
            console.error('Parsing error:', error);
            return null;
        } finally {
            await browser.close();
        }
    }
}
