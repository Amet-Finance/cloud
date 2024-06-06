import { Request, Response } from 'express';
import connection from '../../../db/main';

async function get(req: Request, res: Response) {
    const { contractAddress, chainId } = req.query;

    return res.json({
        issuerGitcoinScore: 10,
        types: ['ibo'],
        boostedMultiplier: 3,
        ametScore: 50,
        verifiedIssuer: true,
    });
}

async function getMultiple(req: Request, res: Response) {}

async function priorityBonds(req: Request, res: Response) {}

const BondControllerV1 = { get, getMultiple, priorityBonds };

export default BondControllerV1;
