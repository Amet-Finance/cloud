import {Request, Response} from "express";
import connection from '../../../db/main'
import {getAddress} from "ethers";

async function getBalance(req: Request, res: Response) {

    try {
        const addressTmp = req.params.address;

        const address = getAddress(addressTmp);

        const balance = await connection
            .balance
            .findOne({
                _id: address.toLowerCase() as any
            })

        return res.json({
            data: balance
        })
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export {
    getBalance
}
