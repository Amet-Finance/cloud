import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES} from "../../../listener/constants";
import {toChecksumAddress} from "web3-utils";


async function getBonds(req: Request, res: Response) {
    const {
        chainId,
        skip,
        limit,
        issuer,
        _id
    } = req.query;
    // todo implement proper pagination
    // todo add address as well for the issuer query
    const findQuery: { [key: string]: string | number| any } = {
        type: CONTRACT_TYPES.ZcbBond
    };

    if (issuer && typeof issuer === "string") {
        findQuery.issuer = toChecksumAddress(issuer)
    }

    if (_id && Array.isArray(_id)) {
        findQuery._id = {
            "$in": _id
        }
    }

    const bonds = await connection.db.collection(`Contract_${chainId}`)
        .find(findQuery)
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

    const bondsMapped = bonds.reduce((acc, item) => {

        const bondDetailedInfo = {
            ...item,
            chainId,
            investmentTokenInfo: tokenInfos[item.investmentToken.toLowerCase()],
            interestTokenInfo: tokenInfos[item.interestToken.toLowerCase()]
        }

        if (bondDetailedInfo.interestTokenInfo && bondDetailedInfo.investmentTokenInfo) {
            acc.push(bondDetailedInfo)
        }

        return acc;
    }, [] as any)


    return res.json({
        data: bondsMapped
    })
}

export {
    getBonds
}
