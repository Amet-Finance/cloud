import {Request, Response} from "express";
import connection from '../../../db/main'

async function getStats(req: Request, res: Response) {
    const data = await connection.db.collection("General").findOne({_id: 'general-stats' as any})

    return res.json({
        data
    })
}

export {
    getStats
}