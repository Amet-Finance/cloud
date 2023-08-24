import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES, DEFAULT_CHAIN} from "../../../listener/constants";


async function getBonds(req: Request, res: Response) {
    const {chainId} = req.query;
    const bonds = await connection.db.collection(`Contract_${Number(chainId)}`)
        .find({
            type: CONTRACT_TYPES.ZcbBond
        }).toArray();

    const tokenContracts = bonds.reduce((acc, item: any) => {
        if (item.investmentToken) {
            acc.add(item.investmentToken.toLowerCase())
        }
        if (item.interestToken) {
            acc.add(item.interestToken.toLowerCase())
        }
        return acc;
    }, new Set())


    const tokenInfosTmp = await connection.db.collection(`Token_${DEFAULT_CHAIN}`).find({
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