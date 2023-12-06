import {Request, Response} from "express";
import {TokenResponse} from "../../../modules/web3/type";

import TokenService from "../../../modules/token";
import {getBalance} from "../../../modules/web3/token";
import {RPCsByChain} from "../../../modules/web3/constants";

async function get(req: Request, res: Response) {
    // todo implement here security checks as well
    const {chainId, contractAddresses, returnBalance, address, verified} = req.query as any;
    const requestBalance = returnBalance === "true" && address;
    const isVerified = verified === "true";
    const contractAddressesUpdated = contractAddresses ? JSON.parse(contractAddresses) : [];

    if (!RPCsByChain[chainId]) {
        throw Error("Chain is not supported")
    }

    let tokens: TokenResponse[] = [];
    const tokenKeyValue: any = {}

    if (contractAddressesUpdated.length) {
        tokens = await TokenService.getMultiple(chainId, contractAddressesUpdated, {isVerified})
    } else if (isVerified) {
        tokens = TokenService.getVerifiedTokens(chainId)
    }

    for (const token of tokens) {
        tokenKeyValue[token._id] = {
            ...token,
            ...(requestBalance ? await getBalance(chainId, token._id, address, token.decimals) : {})
        }
    }

    return res.json(tokenKeyValue)
}

export {
    get
}
