import { NextFunction, Request, Response } from 'express';
import ValidateControllerV1 from '../../controllers/validate/v1';

async function HandlerV1(executable: any, req: Request, res: Response, next: NextFunction) {
    try {
        return await executable(req, res);
    } catch (error: any) {
        return res.status(error.code || 400).json({
            message: error.message,
        });
    }
}

// function Handler(executable: any) {
//     return HandlerV1.bind(null, executable)
// }

export { HandlerV1 };
