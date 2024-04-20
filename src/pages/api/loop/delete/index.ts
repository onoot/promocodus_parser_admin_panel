import {NextApiRequest, NextApiResponse} from "next";
import { exec } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try{
        exec('node delete.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка выполнения скрипта stop.js: ${error}`);
                return res.status(500).json({ error: `Ошибка выполнения: ${error.message}` });
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({ error: stderr });
            }
            console.log(`stdout: ${stdout}`);
            res.status(200).json({ message: 'Скрипт stop.js выполнен' });
        });
    }catch (e) {
        console.log(e)
    }
}