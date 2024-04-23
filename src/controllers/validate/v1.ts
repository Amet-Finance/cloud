import { Request, Response } from 'express';
import axios from 'axios';

async function twitter(req: Request, res: Response) {
    const { state, code } = req.query;

    console.log(`state`, state);
    console.log(`code`, code);

    const request = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        {
            code,
            grant_type: 'authorization_code',
            client_id: 'd295SDkyRFFPWV9mZDZMUV95RDg6MTpjaQ',
            redirect_uri: 'https://api.amet.finance/validate/twitter',
            code_verifier: 'challenge',
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
    );

    console.log(request.data);


}

const ValidateControllerV1 = {
    twitter,
};

export default ValidateControllerV1;
