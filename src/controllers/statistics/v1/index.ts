import {Request, Response} from "express";
import connection from '../../../db/main'


async function getStats(req: Request, res: Response) {
    return res.json({
        data: {
            totalPurchased: 241245.3,
            totalRedeemed: 131245
        }
    })
}

export {
    getStats
}