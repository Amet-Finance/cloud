import { Request, Response } from 'express';
import connection from '../../../db/main';
import ErrorV1 from '../../../routes/error/error';

async function getStats(req: Request, res: Response) {
    const { type } = req.query;

    const cleanType: any = type?.toString() ?? '';

    const availableTypes = ['general-stats', 'tbv-daily-stats'];
    if (!availableTypes.includes(cleanType)) ErrorV1.throw('Invalid type');

    const data = await connection.db.collection('General').findOne({ _id: cleanType });

    return res.json({
        data,
    });
}

export { getStats };
