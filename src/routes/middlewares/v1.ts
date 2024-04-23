import { NextFunction, Request, Response } from 'express';
import { validateSignature } from '../../modules/address/util';
import { validateAddress } from '../../modules/token/util';

function signature(req: Request, res: Response, next: NextFunction) {
    try {
        const { address, signature, message } = req.query;
        validateAddress(address?.toString());
        validateSignature(`${address}`, `${signature}`, `${message}`);
        return next();
    } catch (error) {
        return res.status(400).json({
            message: 'Invalid signature',
        });
    }
}

function outdated(req: Request, res: Response, next: NextFunction) {
    return res.status(410).send('This route is no longer available. Please update your request URL.');
}

const SecurityMiddleware = {
    signature,
    outdated
}
export default SecurityMiddleware;
