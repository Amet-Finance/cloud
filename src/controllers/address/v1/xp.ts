import { Request, Response } from 'express';
import connection from '../../../db/main';
import { StringKeyedObject } from '../../../types';

async function activateAccount(req: Request, res: Response) {
    const { address, ref } = req.query;
    const addressLowercase = `${address}`.toLowerCase();

    const setObject: StringKeyedObject<string | boolean> = {
        active: true,
        code: generateReferralCode(),
    };

    if (ref && Boolean(ref.toString())) {
        setObject.ref = ref.toString();
    }

    await connection.address.findOneAndUpdate(
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
