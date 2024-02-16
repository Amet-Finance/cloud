type TokenResponse = {
    _id: string,
    contractAddress: string,
    chainId: number,
    name: string,
    symbol: string,
    decimals: number,
    isVerified?: boolean,
    unidentified?: boolean,
    icon?: string,
    isStable?: boolean,
    priceUsd?: number
}

type TokenRawData = {
    _id: string,
    chainId: number,

    name: string,
    symbol: string,
    decimals: number
    icon?: string,

    isVerified?: boolean,
    priceUsd?: number,
}

type TokenCacheByChainAndContract = {
    [chainId: string]: {
        [contractAddress: string]: TokenResponse
    }
}


type TokenGetOptions = {
    isVerified?: boolean
}

export type {
    TokenCacheByChainAndContract,
    TokenResponse,
    TokenRawData,
    TokenGetOptions
}
