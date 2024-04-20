import {TaskShop} from "../../modules/AddTaskShop/"

export default async function endPoint(req, res) {
    try {
        const data =  await new TaskShop().getAll()
        res.status(200).json({
            res: true,
            data: data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
    }
}
