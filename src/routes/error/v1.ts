import {NextFunction, Request, Response} from "express";

async function HandlerV1(executable: any, req: Request, res: Response, next: NextFunction) {
    try {
        return await executable(req, res)
    } catch (error: any) {
        console.error(`HandlerV1`, `${executable}`, error)
        return res.status(error.code || 400).json({
            message: error.message
        })
    }
}

export {
    HandlerV1
}
