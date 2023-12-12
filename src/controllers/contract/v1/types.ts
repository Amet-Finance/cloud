import {TokenBalance, TokenResponse} from "../../../modules/web3/type";

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
    issuanceDate: number,
    issuanceBlock: number
}

type ContractInfoOptions = {
    contractBalance?: boolean,
    tokensIncluded?: boolean
}


type Description = {
    name: string,
    description: string,
    external_url: string,
    image: string,
    details?: {
        title: string,
        description: string
    }
}

type SecurityDetails = {
    securedPercentage: number,
    issuerScore: number,
    bondScore: number,
    uniqueHolders: number,
    uniqueHoldersIndex: number
}

type DetailedBondResponse = {
    description: Description,
    contractInfo: BondInfoDetailed,
    securityDetails: SecurityDetails
}

export type  {
    DetailedBondResponse,
    SecurityDetails,
    Description,
    ContractInfoOptions,
    BondInfoDetailed
}
