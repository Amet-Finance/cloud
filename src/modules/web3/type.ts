type Token = {
    _id: string,
    name: string,
    symbol: string,
    decimals: number,
    icon?: string
}

type TokenResponse = {
    _id: string,
    name: string,
    symbol: string,
    decimals: number,
    isVerified: boolean,
    icon?: string,
    isStable?: boolean
}

type RpcByChain = {
    [key: number]: {
        def: string[],
        fallback: string[]
    }
}

export type  {
    Token,
    TokenResponse,
    RpcByChain
}
