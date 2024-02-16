import connection from "../../db/main";
import {TokenCacheByChainAndContract, TokenGetOptions, TokenRawData, TokenResponse} from "./types";
import {nop} from "../utils/functions";
import {generateTokenResponse, validateAddress} from "./util";
import {getTokenInfo} from "../web3/token";

let tokenCacheByChainAndContract: TokenCacheByChainAndContract = {}

async function cache() {
    try {
        let localCacheByChainAndContract: TokenCacheByChainAndContract = {}

        const tokensRaw: any = await connection.db.collection(`Token`).find({}).toArray();
        for (const token of tokensRaw as TokenRawData[]) {

            const {_id, chainId} = token
            const [contractAddress, _] = _id.toLowerCase().split("_")

            if (!localCacheByChainAndContract[chainId]) localCacheByChainAndContract[chainId] = {}
            localCacheByChainAndContract[chainId][contractAddress] = {
                _id: token._id,
                contractAddress: contractAddress,
                chainId: chainId,
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


function getTokensByChain(chainId: number) {
    return tokenCacheByChainAndContract[chainId] || {}
}

async function get(chainId: number, contractAddress: string, options?: TokenGetOptions): Promise<TokenResponse | null> {
    validateAddress(contractAddress);
    const localToken = getTokensByChain(chainId)?.[contractAddress.toLowerCase()]
    if (localToken) {
        if (options?.isVerified && !localToken.isVerified) return null;
        return generateTokenResponse(chainId, localToken);
    }

    const tokenFromBlockchain = await getTokenInfo(chainId, contractAddress);
    const tokenResponse = generateTokenResponse(chainId, tokenFromBlockchain);
    updateLocalCache(chainId, tokenResponse);
    updateInDatabase(tokenResponse).catch(nop);

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

function updateLocalCache(chainId: number, token: TokenResponse) {
    if (!tokenCacheByChainAndContract[chainId]) tokenCacheByChainAndContract[chainId] = {}
    tokenCacheByChainAndContract[chainId][token._id.toLowerCase()] = token;
}

const TokenService = {
    cache,
    get,
    getMultiple,
    getVerifiedTokens
}
export default TokenService;

