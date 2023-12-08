import {TokenBalance, TokenResponse} from "../../type";

type BondInfoDetailed = {
    _id: string,
    chainId: number,
    issuer: string,
    total: number,
    purchased: number,
    redeemed: number,
    redeemLockPeriod: number,

    investmentToken: string,
    investmentTokenAmount: string,
    investmentTokenInfo?: TokenResponse

    interestToken: string,
    interestTokenAmount: string,
    interestTokenInfo?: TokenResponse

    interestTokenBalance?: TokenBalance,
    feePercentage: number,
    issuanceDate: number
}

type ContractInfoOptions = {
    contractBalance?: boolean,
    tokensIncluded?:boolean
}

export type {
    ContractInfoOptions,
    BondInfoDetailed
}
