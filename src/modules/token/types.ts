import {TokenResponse} from "../web3/type";

type TokenCacheGlobal = {
    [chainId: string]: {
        [contractAddress: string]: TokenResponse
    }
}

type TokenGetOptions = {
    isVerified: boolean
}

export type {
    TokenCacheGlobal,
    TokenGetOptions
}
