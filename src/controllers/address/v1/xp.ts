import { Request, Response } from 'express';
import connection from '../../../db/main';
import { StringKeyedObject } from '../../../types';
import ErrorV1 from '../../../routes/error/error';
import { XpList } from './constants';

async function activateAccount(req: Request, res: Response) {
    const { address, ref } = req.query;
    const addressLowercase = `${address}`.toLowerCase();
    const refCode = ref?.toString();

    console.log(`Activate: ${addressLowercase}`);

    const user = await connection.address.findOne({
        _id: addressLowercase.toString(),
    });

    console.log(`User: ${user}`);

    if (user) {
        if (user.active) return ErrorV1.throw(`Already activated user: ${addressLowercase}`);
        if (refCode && user.code === refCode) return ErrorV1.throw(`Referral logic violation: ${addressLowercase}`);
    }

    const setObject: StringKeyedObject<string | boolean | number | Date> = {
        active: true,
        code: generateReferralCode(),
        xp: XpList.JoinXP,
        lastUpdated: new Date(),
    };

    if (refCode && Boolean(refCode)) {
        setObject.ref = refCode;
    }

    await connection.address.updateOne(
        {
            _id: addressLowercase as any,
            active: { $exists: false }, // Only match if 'active' does not exist
        },
        {
            $set: setObject,
        },
        {
            upsert: true, // Insert a new document if no document matches the query
        },
    );

    return res.json({
        success: true,
    });
}

function generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

const XpSystemControllerV1 = {
    activateAccount,
};

export default XpSystemControllerV1;
