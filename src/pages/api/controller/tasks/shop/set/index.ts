import {updateRunInJSONFile} from "../../../store/utils/utils";
import {TaskShop} from "../../../modules/AddTaskShop";


export default async function endPoint(req, res) {
    try {
        const data = req.body;
        const {run, id} = data.date;
        await new TaskShop().add(id, run)

        if (run===true) {
            res.status(200).json({
                res: true,
                data: 'run'
            })
        }else if (run===false) {
           res.status(200).json({
                res: true,
                data: 'stop'
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            res: false,
            error: 'Internal Server Error',
        });
    }
}
