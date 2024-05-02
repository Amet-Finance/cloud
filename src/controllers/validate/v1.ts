import { Request, Response } from 'express';
import qs from 'qs';
import Requests from '../../modules/utils/requests';
import connection from '../../db/main';
import { getAddress } from 'ethers';
import { AMET_WEB_URL } from '../../constants';

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
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: 'https://api.amet.finance/validate/twitter',
                code_verifier: 'challenge',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${process.env.TWITTER_TOKEN}`,
                },
            },
        );

        const userInfo = await Requests.get(`https://api.twitter.com/2/users/me`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        await connection.address.updateOne(
            {
                _id: address.toLowerCase() as any,
            },
            {
                $set: {
                    twitter: {
                        id: userInfo.data.id,
                        username: userInfo.data.username,
                    },
                },
            },
        );

        return res.redirect(`${AMET_WEB_URL}/auth/success`);
    } catch (error: any) {
        return res.redirect(`${AMET_WEB_URL}/auth/failure`);
    }
}

async function discord(req: Request, res: Response) {

    const { state, code } = req.query;

    try {
        if (!state) throw Error('State is missing!');

        const address = getAddress(state.toString());

        const tokens = await Requests.post(
            'https://discord.com/api/v10/oauth2/token',
            qs.stringify({
                code,
                grant_type: 'authorization_code',
                client_id: process.env.DISCORD_CLIENT_ID,
                redirect_uri: 'https://api.amet.finance/validate/discord',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic AAAAAAAAAAAAAAAAAAAAAJnWtQEAAAAA4uWj4vELj1ziLpOAVv%2BV8TRq%2FfY%3Dy3HGNermDbHvGXJpMxTVksyptDDaDe3RawR4GIOwMxEZpwtBQx`,
                },
                auth: {
                    username: process.env.DISCORD_CLIENT_ID as string,
                    password: process.env.DISCORD_CLIENT_SECRET as string,
                },
            },
        );


        const user = await Requests.get(
            `https://discord.com/api/v10/users/@me`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        );

        const ametServerId = '1142005217399943250';
        try {
            await Requests.get(
                `https://discord.com/api/v10/users/@me/guilds/${ametServerId}/member`,
                { headers: { Authorization: `Bearer ${tokens.access_token}` } },
            );
        } catch (error: any) {
            await Requests.put(
                `https://discord.com/api/v10/guilds/${ametServerId}/members/${user.id}`,
                { access_token: tokens.access_token },
                {
                    headers: {
                        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    },
                },
            );
        }

        await connection.address.updateOne(
            {
                _id: address.toLowerCase() as any,
            },
            {
                $set: {
                    discord: {
                        id: user.id,
                        username: user.username
                    },
                },
            },
        );

        return res.redirect(`${AMET_WEB_URL}/auth/success`);
    } catch (error: any) {
        console.log(error);
        return res.redirect(`${AMET_WEB_URL}/auth/failure`);
    }
}

async function email(req: Request, res: Response) {
    try {
        const { code } = req.query;

        const account = await connection.address.findOne({
            emailCode: code?.toString().toLowerCase() as any,
        });

        if (!account) throw Error('Address is missing');

        await connection.address.updateOne(
            {
                _id: account._id,
            },
            {
                $set: {
                    email: account.emailPending,
                },
                $unset: {
                    emailCode: 1,
                    emailPending: 1,
                },
            },
        );

        return res.redirect(`${AMET_WEB_URL}/auth/success`);
    } catch (error: any) {
        return res.redirect(`${AMET_WEB_URL}/auth/failure`);
    }
}

const ValidateControllerV1 = {
    twitter,
    discord,
    email,
};

export default ValidateControllerV1;
