import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';

async function twitter(req: Request, res: Response) {
    const { state, code } = req.query;

    console.log(req.query);

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
                    'Authorization': `Basic AAAAAAAAAAAAAAAAAAAAAJnWtQEAAAAA4uWj4vELj1ziLpOAVv%2BV8TRq%2FfY%3Dy3HGNermDbHvGXJpMxTVksyptDDaDe3RawR4GIOwMxEZpwtBQx`,
                },
            },
        );

        // {
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]:   token_type: 'bearer',
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]:   expires_in: 7200,
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]:   access_token: 'enBhOUdhYkExNFk3a2M0azJfVktLaGtKYktqQ2NkenVoM1c1Q25CeXFDOGtsOjE3MTM4NzIyMDg0Mzk6MTowOmF0OjE',
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]:   scope: 'follows.read offline.access users.read tweet.read follows.write',
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]:   refresh_token: 'dDh5czU1NGZ0UW45SWJ1RTZoclJOa1c1Y2VJVGFESGhCMjRxT0xJM2dRWWpEOjE3MTM4NzIyMDg0Mzk6MTowOnJ0OjE'
        //     Apr 23 11:36:48 ip-172-31-28-144 npm[248872]: }

        console.log(request.data);

        return res.json(request.data)
    } catch (error: any) {
        console.log(error.message);
        console.log(error);
    }
}

const ValidateControllerV1 = {
    twitter,
};

export default ValidateControllerV1;
