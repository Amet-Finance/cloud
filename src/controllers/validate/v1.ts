import { Request, Response } from 'express';
import qs from 'qs';
import Requests from '../../modules/utils/requests';

async function twitter(req: Request, res: Response) {
    const { code } = req.query;

    try {
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

        console.log(userInfo.data);

        // const userFollowers = await Requests.get(
        //     `https://api.twitter.com/2/users/${userInfo.data.id}/followers`,
        //     { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        // );

        // console.log(userFollowers);

        const followStatus = await Requests.post(
            `https://api.twitter.com/2/users/${userInfo.data.id}/following`,
            { target_user_id: '1687523571864653825' },
            { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        );

        console.log(followStatus);

        // todo change localhost
        return res.redirect('http://localhost:3000/auth/success');
    } catch (error: any) {
        console.log(error);
        return res.redirect('http://localhost:3000/auth/failure');
    }
}

const ValidateControllerV1 = {
    twitter,
};

export default ValidateControllerV1;
