import {Request, Response} from "express";

import TokenService from "../../../modules/token";
import {TokenResponse} from "../../../modules/token/types";
import {Erc20Controller, RPCsByChain} from "amet-utils";

async function get(req: Request, res: Response) {
    // todo implement here security checks as well

    const {chainId, contractAddresses, returnBalance, address, verified} = req.query as any;
    const requestBalance = returnBalance === "true" && address;
    const isVerified = verified === "true";
    const contractAddressesUpdated = contractAddresses ? JSON.parse(contractAddresses) : [];

    if ((requestBalance || contractAddressesUpdated.length) && !RPCsByChain[chainId]) {
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
        const [contractAddress] = token._id.toLowerCase().split("_");


        tokenKeyValue[contractAddress] = {
            ...token,
            ...(requestBalance ? await Erc20Controller.getTokenBalanceNormalized(chainId, contractAddress, address, token.decimals) : {})
        }
    }

    return res.json(tokenKeyValue)
}

export {
    get
}
