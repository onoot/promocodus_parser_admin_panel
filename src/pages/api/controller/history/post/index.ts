import db from '../../../bd';

export default async function postHistory(dataArray) {
    try {
        //histoty новый
        await db.history.create({
            name: dataArray.name,
            lastRun: dataArray.lastRun,
            type: dataArray.type,
            urls: dataArray.urls,
            parseUrls: false,
        });


        return {
            res: true,
            data: dataArray,
        };
    } catch (err) {
        console.error(err);
        return {
            res: false,
            error: 'Internal Server Error',
        };
    }
}
