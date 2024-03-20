import connection from "../../db/main";
import {TokenCacheByChainAndContract, TokenGetOptions, TokenResponse} from "./types";
import {nop} from "../utils/functions";
import {generateTokenResponse, validateAddress} from "./util";
import {Erc20Controller} from "amet-utils";

let tokenCacheByChainAndContract: TokenCacheByChainAndContract = {}

async function cache() {
    try {
        let localCacheByChainAndContract: TokenCacheByChainAndContract = {}

        const tokensRaw = await connection.token.find({}).toArray();
        for (const token of tokensRaw) {

            const {_id} = token;
            const [contractAddress, chainId] = _id.toLowerCase().split("_")

            if (!localCacheByChainAndContract[chainId]) localCacheByChainAndContract[chainId] = {}
            localCacheByChainAndContract[chainId][contractAddress] = {
                _id: token._id,
                contractAddress: contractAddress,
                chainId: Number(chainId),
                name: token.name,
                symbol: token.symbol,
                icon: token.icon,
                decimals: token.decimals,
                isVerified: Boolean(token.isVerified),
                priceUsd: token.priceUsd
            };

        }

        tokenCacheByChainAndContract = localCacheByChainAndContract;
    } catch (error: any) {
        console.error(`Token cache| ${error.message}`)
    }
}


function getTokensByChain(chainId: number|string) {
    return tokenCacheByChainAndContract[chainId] || {}
}

async function get(chainId: number|string, contractAddress: string, options?: TokenGetOptions): Promise<TokenResponse | null> {
    try {
        chainId = Number(chainId);
        validateAddress(contractAddress);
        const localToken = getTokensByChain(chainId)?.[contractAddress.toLowerCase()]
        if (localToken) {
            if (options?.isVerified && !localToken.isVerified) return null;
            return generateTokenResponse(chainId, localToken);
        }

        const tokenFromBlockchain = await Erc20Controller.getTokenDetails(chainId, contractAddress);
        const tokenResponse = generateTokenResponse(chainId, tokenFromBlockchain);
        updateLocalCache(chainId, tokenResponse);
        updateInDatabase(tokenResponse).catch(nop);

        return tokenResponse;
    } catch (error: any) {
        return null;
    }
}

async function getMultiple(chainId: number, contractAddresses: string[], options?: TokenGetOptions): Promise<TokenResponse[]> {

    const response = []
    for (const contractAddress of contractAddresses) {
        const token = await get(chainId, contractAddress, options);
        if (token) response.push(token);
    }

    return response;
}

function getVerifiedTokens(chainId: number, limit?: number): TokenResponse[] {
    const tokensByChain = getTokensByChain(chainId);

    const response = []
    for (const contractAddress in tokensByChain) {
        if (tokensByChain[contractAddress].isVerified) {
            response.push(generateTokenResponse(chainId, tokensByChain[contractAddress]));
        }

        if (limit && response.length === limit) {
            break;
        }
    }

    return response;
}

async function updateInDatabase(token: TokenResponse) {
    await connection.db.collection("Token").insertOne(token as any)
}

function updateLocalCache(chainId: number|string, token: TokenResponse) {
    if (!tokenCacheByChainAndContract[chainId]) tokenCacheByChainAndContract[chainId] = {}
    tokenCacheByChainAndContract[chainId][token.contractAddress.toLowerCase()] = token;
}

const TokenService = {
    cache,
    get,
    getMultiple,
    getVerifiedTokens
}
export default TokenService;

