import {NextApiRequest, NextApiResponse} from "next";
import postHistory from "../../history/post";
import {getStore} from "../../modules/gerStore";
import {saveStore} from "./save";

const moscowTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        timeStyle: 'medium',
        dateStyle: 'medium',
    }).format(new Date());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   try{
       const data = await new getStore().parse()

       await postHistory({
           name: 'Получить все Shop',
           lastRun: moscowTime,
           type: 'get_all_shop',
           urls: '',
           parseUrls: false,
       });

       if (data){
           res.status(200).json({res: true, message: data});
       }else{
           res.status(500).json({res: false, message: data});
       }

       await saveStore(data)

   }catch (e) {
       console.log('Ошибка: ',e)
       res.status(500).json({error: 'Ошибка сервера при обработке запроса'})
   }
}

