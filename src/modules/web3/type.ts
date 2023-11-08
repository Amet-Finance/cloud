type Token = {
    _id: string,
    name: string,
    symbol: string,
    decimals: number,
    icon?: string
}

type TokenResponse = {
    name: string,
    symbol: string,
    decimals: number,
    isVerified: boolean,
    icon?: string
}

export type  {
    Token,
    TokenResponse
}
