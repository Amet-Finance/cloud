type TokenResponse = {
    _id: string;
    contractAddress: string;
    chainId: number;
    name: string;
    symbol: string;
    decimals: number;
    isVerified?: boolean;
    unidentified?: boolean;
    icon?: string;
    priceUsd?: number;
};

type TokenRawData = {
    _id: string;
    contractAddress: string;
    chainId: number;

    name: string;
    symbol: string;
    decimals: number;
    icon?: string;

    cmId?: string;
    uniV3?: string;

    isVerified?: boolean;
    priceUsd?: number;
};

type TokenCacheByChainAndContract = {
    [chainId: string]: {
        [contractAddress: string]: TokenResponse;
    };
};

type TokenGetOptions = {
    isVerified?: boolean;
    onlyFromCache?: boolean;
};

export type { TokenCacheByChainAndContract, TokenResponse, TokenRawData, TokenGetOptions };
