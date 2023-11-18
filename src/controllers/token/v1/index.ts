import {Request, Response} from "express";
import {TokenResponse} from "../../../modules/web3/type";
import {getBalance} from "../../../listener/zcb/token";
import TokenService from "../../../modules/token";

async function get(req: Request, res: Response) {
    try {
        // todo implement here security checks as well
        const {chainId, contractAddresses, returnBalance, address, verified} = req.query as any;
        const requestBalance = returnBalance === "true" && address;
        const isVerified = verified === "true";
        const contractAddressesUpdated = contractAddresses ? JSON.parse(contractAddresses) : [];

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
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export {
    get
}
