import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';

async function twitter(req: Request, res: Response) {
    const { state, code } = req.query;

    console.log(`state`, state);
    console.log(`code`, code);

    const data = qs.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: 'd295SDkyRFFPWV9mZDZMUV95RDg6MTpjaQ',
        redirect_uri: 'https://api.amet.finance/validate/twitter',
        code_verifier: 'challenge',
    });

    try {
        const request = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
            data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic `,
                },
            },
        );

        console.log(request.data);
    } catch (error: any) {
        console.log(error.message);
        console.log(error);
    }
}

const ValidateControllerV1 = {
    twitter,
};

export default ValidateControllerV1;
