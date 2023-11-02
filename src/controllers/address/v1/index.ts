import {Request, Response} from "express";
import connection from '../../../db/main'
import {validateAddress, validateSignature} from "./util";

async function get(req: Request, res: Response) {
    try {
        const {address} = req.query as any;
        validateAddress(address);
        const addressInfo = await connection.db.collection("Address").findOne({_id: address.toLowerCase()})
        return res.json(addressInfo)
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

async function post(req: Request, res: Response) {

    try {

        const {address, signature, message} = req.query as any;
        const {twitter, telegram, reddit, image} = req.body;
        validateSignature(address, signature, message);


        const addressInfo: any = {}

        if (twitter) {
            addressInfo.twitter = twitter
        }

        if (telegram) {
            addressInfo.telegram = telegram
        }

        if (reddit) {
            addressInfo.reddit = reddit
        }

        if (image) {
            addressInfo.image = image
        }

        await connection.db.collection("Address").updateOne({
            _id: address.toLowerCase()
        }, {
            $set: addressInfo
        }, {
            upsert: true
        })

        return res.json({
            success: true
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

async function del(req: Request, res: Response) {
    try {

        const {address, signature, message} = req.query as any;
        validateSignature(address, signature, message);

        await connection.db.collection("Address").deleteOne({_id: address})
        return res.json({
            success: true
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export {
    get,
    post,
    del
}
