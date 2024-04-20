import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const fileContent = fs.readFileSync('nextjs_output.log', 'utf-8');
        res.status(200).send(fileContent);
    } catch (error) {
        res.status(500).send(error.message);
    }
}