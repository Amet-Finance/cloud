import {Request, Response} from "express";
import connection from '../../../db/main'
import {CONTRACT_TYPES} from "../../../listener/constants";
import {toChecksumAddress} from "web3-utils";
import {generateTokenResponse} from "../../token/v1/util";
import TokenService from "../../../modules/token";


async function getBonds(req: Request, res: Response) {
    const {
        chainId,
        skip,
        limit,
        issuer,
        isTrending,
        _id
    } = req.query;

    // todo implement proper pagination
    // todo add address as well for the issuer query

    const findQuery: { [key: string]: string | number | any } = {
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

    if (isTrending) {
        findQuery.trending = true;
    }

    const bonds = await connection.db.collection(`Contract_${chainId}`)
        .find(findQuery)
        .skip(Number(skip) || 0)
        .limit(Number(limit) || 20)
        .toArray();


    const bondsDetailed = []

    for (const bond of bonds) {
        const investmentTokenInfo = await TokenService.get(Number(chainId), bond.investmentToken);
        const interestTokenInfo = await TokenService.get(Number(chainId), bond.interestToken);

        const bondInfo = {
            ...bond,
            chainId,
            investmentTokenInfo,
            interestTokenInfo
        }

        if (!bondInfo.investmentTokenInfo || !bondInfo.interestTokenInfo) {
            continue;
        }
        bondsDetailed.push(bondInfo)
    }

    return res.json({
        data: bondsDetailed
    })
}

export {
    getBonds
}
