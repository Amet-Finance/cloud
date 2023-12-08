import {TokenBalance} from "../../type";

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
    interestToken: string,
    interestTokenAmount: string,
    interestTokenBalance?: TokenBalance,
    feePercentage: number,
    issuanceDate: number
}

type ContractInfoOptions = {
    contractBalance?: boolean,
}

export type {
    ContractInfoOptions,
    BondInfoDetailed
}
