import { Request, Response } from 'express';
import qs from 'qs';
import Requests from '../../modules/utils/requests';
import connection from '../../db/main';
import { getAddress } from 'ethers';

async function twitter(req: Request, res: Response) {
    const { state, code } = req.query;

    try {
        if (!state) throw Error('State is missing!');

        const address = getAddress(state.toString());

        const tokens = await Requests.post(
            'https://api.twitter.com/2/oauth2/token',
            qs.stringify({
                code,
                grant_type: 'authorization_code',
                client_id: 'd295SDkyRFFPWV9mZDZMUV95RDg6MTpjaQ',
                redirect_uri: 'https://api.amet.finance/validate/twitter',
                code_verifier: 'challenge',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic AAAAAAAAAAAAAAAAAAAAAJnWtQEAAAAA4uWj4vELj1ziLpOAVv%2BV8TRq%2FfY%3Dy3HGNermDbHvGXJpMxTVksyptDDaDe3RawR4GIOwMxEZpwtBQx`,
                },
            },
        );

        const userInfo = await Requests.get(
            `https://api.twitter.com/2/users/me`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        );

        await connection.address.updateOne(
            {
                _id: address.toLowerCase() as any,
            },
            {
                $set: {
                    twitter: userInfo.data.username,
                },
            },
        );

        return res.redirect('http://localhost:3000/auth/success');
    } catch (error: any) {
        return res.redirect('http://localhost:3000/auth/failure');
    }
}

const ValidateControllerV1 = {
    twitter,
};

export default ValidateControllerV1;
