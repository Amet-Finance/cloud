import connection from "../../db/main";
import {TokenResponse} from "../web3/type";
import {TokenCacheGlobal, TokenGetOptions} from "./types";
import {getTokenInfo} from "../../listener/zcb";
import {generateTokenResponse, validateAddress} from "../../controllers/token/v1/util";
import {nop} from "../utils/functions";

let globalCache: TokenCacheGlobal = {}

async function cache(chainIds: number[]) {
    try {
        let localCacheTmp: TokenCacheGlobal = {}

        for (const chainId of chainIds) {
            localCacheTmp[chainId] = {}
            const verifiedTokens: any = await connection.db.collection(`Token_${chainId}`).find({}).toArray();
            verifiedTokens.forEach((token: TokenResponse) => {
                localCacheTmp[chainId][token._id.toLowerCase()] = {
                    ...token,
                    _id: token._id.toLowerCase()
                }
            })
        }

        globalCache = localCacheTmp;
    } catch (error: any) {
        console.error(`Token cache| ${error.message}`)
    }
}


function getTokensByChain(chainId: number) {
    return globalCache[chainId] || {}
}

async function get(chainId: number, contractAddress: string, options?: TokenGetOptions): Promise<TokenResponse | null> {
    validateAddress(contractAddress);
    const local = getTokensByChain(chainId)?.[contractAddress.toLowerCase()]
    if (local) {
        if (options?.isVerified && !local.isVerified) {
            return null;
        }
        return generateTokenResponse(chainId, local);
    }

    const tokenFromBlockchain = await getTokenInfo(chainId, contractAddress);
    const tokenResponse = generateTokenResponse(chainId, tokenFromBlockchain);
    updateLocalCache(chainId, tokenResponse);
    updateInDatabase(chainId, tokenResponse).catch(nop);

    return tokenResponse;
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
            response.push(tokensByChain[contractAddress]);
        }

        if (limit && response.length === limit) {
            break;
        }
    }

    return response;
}

function getStableTokens(chainId: number, limit?: number): TokenResponse[] {
    const tokensByChain = getTokensByChain(chainId);

    const response = []
    for (const contractAddress in tokensByChain) {
        if (tokensByChain[contractAddress].isStable) {
            response.push(tokensByChain[contractAddress]);
        }

        if (limit && response.length === limit) {
            break;
        }
    }

    return response;
}

async function updateInDatabase(chainId: number, token: TokenResponse) {
    await connection.db.collection(`Token_${chainId}`).insertOne({
        ...token,
        _id: token._id.toLowerCase() as any
    })
}

function updateLocalCache(chainId: number, token: TokenResponse) {
    if (!globalCache[chainId]) globalCache[chainId] = {}
    globalCache[chainId][token._id.toLowerCase()] = token;
}


const TokenService = {
    cache,
    get,
    getMultiple,
    getVerifiedTokens,
    getStableTokens
}
export default TokenService;

