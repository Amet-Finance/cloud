import {Request, Response} from "express";
import connection from '../../../db/main'
import {validateAddress, validateSignature} from "./util";
import {uploadFile} from "./ipfs";

async function get(req: Request, res: Response) {
    try {
        const {address} = req.query as any;
        validateAddress(address);
        const addressInfo = await connection.db.collection("Address").findOne({_id: address})
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

        // const addressInfoTmp = await connection.db.collection("Address").findOne({_id: address})

        const addressInfo: any = {}

        if (twitter) {
            addressInfo.twitter = twitter
        }

        if (telegram) {
            addressInfo.twitter = telegram
        }

        if (image) {
            addressInfo.image = image
        }

        const response = await uploadFile({name: address.toLowerCase(), pinataContent: addressInfo})
        if (response.IpfsHash) {
            await connection.db.collection("Address").updateOne({
                _id: address.toLowerCase()
            }, {
                $set: {
                    ipfsHash: response.IpfsHash
                }
            }, {
                upsert: true
            })
        }

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

        const {address} = req.query as any;
        validateAddress(address);

        return await connection.db.collection("Address").findOne({_id: address})
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export {
    get,
    post,
    del
}
