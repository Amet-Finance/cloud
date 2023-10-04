import {Request, Response} from "express";
import {toChecksumAddress} from "web3-utils"
import connection from '../../../db/main'

async function getBalance(req: Request, res: Response) {

    try {
        const {chainId} = req.query;
        const addressTmp = req.params.address;

        const address = toChecksumAddress(addressTmp);


        const balance = await connection.db
            .collection(`Balance_${Number(chainId)}`)
            .findOne({
                _id: address.toLowerCase() as any
            })
        return res.json({
            data: balance
        })
    } catch (error: Error | any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export {
    getBalance
}