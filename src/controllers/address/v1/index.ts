import { Request, Response } from 'express';
import connection from '../../../db/main';
import { validateAddress } from '../../../modules/token/util';

async function get(req: Request, res: Response) {
    const { address } = req.query as any;
    validateAddress(address);
    const addressInfo = await connection.address.findOne({
        _id: address.toLowerCase(),
    });

    if (!addressInfo) {
        //todo update later
        return res.json({ xp: 0 });
    }
    return res.json(addressInfo);
}

async function post(req: Request, res: Response) {
    const { address } = req.query as any;
    const { twitter, telegram, reddit, image } = req.body;

    const addressInfo: any = {};

    if (twitter) addressInfo.twitter = twitter;

    if (telegram) addressInfo.telegram = telegram;

    if (reddit) addressInfo.reddit = reddit;

    if (image) addressInfo.image = image;

    await connection.address.updateOne(
        {
            _id: address.toLowerCase(),
        },
        {
            $set: addressInfo,
        },
        {
            upsert: true,
        },
    );

    return res.json({
        success: true,
    });
}

async function del(req: Request, res: Response) {
    const { address } = req.query as any;

    await connection.address.deleteOne({ _id: address });
    return res.json({
        success: true,
    });
}

export {
    get,
    post,
    del
}
