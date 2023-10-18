import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES} from "../../../listener/constants";


async function getBonds(req: Request, res: Response) {
    const {chainId, skip, limit} = req.query;
    const bonds = await connection.db.collection(`Contract_${chainId}`)
        .find({
            type: CONTRACT_TYPES.ZcbBond
        })
        .skip(Number(skip) || 0)
        .limit(Number(limit) || 20)
        .toArray();

    const tokenContracts = bonds.reduce((acc, item: any) => {
        if (item.investmentToken) {
            acc.add(item.investmentToken.toLowerCase())
        }
        if (item.interestToken) {
            acc.add(item.interestToken.toLowerCase())
        }
        return acc;
    }, new Set())


    const tokenInfosTmp = await connection.db.collection(`Token_${chainId}`).find({
        _id: {$in: Array.from(tokenContracts) as any}
    }).toArray();

    const tokenInfos = tokenInfosTmp.reduce((acc: any, item: any) => {
        const itemWithoutId = {...item};
        delete itemWithoutId._id;
        acc[item._id] = itemWithoutId;
        return acc;
    }, {} as any);

    const bondsMapped = bonds.map(item => ({
        ...item,
        chainId,
        investmentTokenInfo: tokenInfos[item.investmentToken.toLowerCase()],
        interestTokenInfo: tokenInfos[item.interestToken.toLowerCase()]
    }))


    return res.json({
        data: bondsMapped
    })
}

export {
    getBonds
}