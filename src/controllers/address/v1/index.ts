import { Request, Response } from 'express';
import connection from '../../../db/main';
import { validateAddress } from '../../../modules/token/util';
import AddressEmailController from './email';
import { AddressRawData, AddressResponse } from '../../../modules/address/types';
import { WithId } from 'mongodb';

async function get(req: Request, res: Response) {
    const { address } = req.query as any;
    validateAddress(address);

    const addressInfo = await connection.address.findOne({
        _id: address.toLowerCase(),
    });

    return res.json(addressModifier(address, addressInfo));
}


async function post(req: Request, res: Response) {
    // const { address } = req.query as any;
    // const { twitter, telegram, reddit, image } = req.body;
    //
    // const addressInfo: any = {};
    //
    // if (twitter) addressInfo.twitter = twitter;
    //
    // if (telegram) addressInfo.telegram = telegram;
    //
    // if (reddit) addressInfo.reddit = reddit;
    //
    // if (image) addressInfo.image = image;
    //
    // await connection.address.updateOne(
    //     {
    //         _id: address.toLowerCase(),
    //     },
    //     {
    //         $set: addressInfo,
    //     },
    //     {
    //         upsert: true,
    //     },
    // );

    return res.json({
        success: true,
    });
}

async function patch(req: Request, res: Response) {
    const { address } = req.query;
    const { email } = req.body;

    switch (true) {
        case Boolean(email):
            await AddressEmailController.updateEmail(`${address}`, email);
    }

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


function addressModifier(address: string, addressRaw: WithId<AddressRawData> | null): AddressResponse {
    return {
        _id: addressRaw?._id ?? address,
        active: addressRaw?.active,

        code: addressRaw?.code,
        ref: addressRaw?.ref,

        discord: addressRaw?.discord,
        email: addressRaw?.email,
        emailPending: addressRaw?.emailPending,
        lastUpdated: addressRaw?.lastUpdated,

        twitter: addressRaw?.twitter,
        xp: addressRaw?.xp ?? 0,
    };
}

const AddressControllerV1 = {
    get,
    post,
    patch,
    del,
};

export default AddressControllerV1;
