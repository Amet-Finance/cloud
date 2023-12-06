import {NextFunction, Request, Response} from "express";
import {validateSignature} from "../../modules/address/util";

function signature(req: Request, res: Response, next: NextFunction) {
    try {
        const {address, signature, message} = req.query;
        validateSignature(`${address}`, `${signature}`, `${message}`);
        next();
    } catch (error) {
        res.status(400).json({
            message: "Invalid signature"
        })
    }

}

const SecurityMiddleware = {
    signature
}
export default SecurityMiddleware;
