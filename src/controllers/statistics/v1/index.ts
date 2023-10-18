import {Request, Response} from "express";
import connection from '../../../db/main'

async function getStats(req: Request, res: Response) {

    // todo this route has chainId, so the only chain data should be returned
    // in general add general-stats-0x1335.... and etc..
    const {chainId} = req.query
    const data = await connection.db.collection("General").findOne({_id: 'general-stats' as any})

    return res.json({
        data
    })
}

export {
    getStats
}