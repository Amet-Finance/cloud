import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES} from "../../../listener/constants";

async function getStats(req: Request, res: Response) {
    const {chainId} = req.query;
    const issued = await connection.db.collection(`Contract_${chainId}`).countDocuments({type: {$ne: CONTRACT_TYPES.ZcbIssuer}});
    // todo better to have one collection for general stats
    // and run a job which will calculate all these things

    return res.json({
        data: {
            issued: issued,
            volumeUSD: Math.round(Math.random() * 1000000),
            purchased: Math.round(Math.random() * 5000),
            redeemed: Math.round(Math.random() * 3000)
        }
    })
}

export {
    getStats
}