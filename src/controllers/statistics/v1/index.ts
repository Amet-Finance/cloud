import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES, DEFAULT_CHAIN} from "../../../listener/constants";


async function getStats(req: Request, res: Response) {
    // const issued = await connection.db.collection(`Contract_${DEFAULT_CHAIN}`).countDocuments({type: {$ne: CONTRACT_TYPES.ZcbIssuer}});
    // todo better to have one collection for general stats

    return res.json({
        data: {
            issued: Math.round(Math.random() * 1000),
            volumeUSD: Math.round(Math.random() * 1000000),
            purchased: Math.round(Math.random() * 5000),
            redeemed: Math.round(Math.random() * 3000)
        }
    })
}

export {
    getStats
}