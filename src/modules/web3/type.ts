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

type TokenBalance = {
    balance: string,
    balanceClean: number
}


export type  {
    TokenResponse,
    RpcByChain,
    TokenBalance
}
