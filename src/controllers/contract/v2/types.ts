import {TokenResponse} from "../../../modules/token/types";

type ContractQuery = {
    _id?: string | { $in: string[] }
    chainId?: number,
    type?: string,
    trending?: boolean
}

type ContractSortQuery = {
    score?: number
}

type TransformDataConfig = {
    responseFormat: string
}


type ContractRawData = {
    _id: string, // "0xf236f59f0f2a192bd521a11706e897bdb9fab6e4_80001"
    issuer: string,
    chainId: number,

    total: number,
    purchased: number,
    redeemed: number,
    maturityPeriod: number,

    investmentToken: string,
    investmentAmount: string,
    interestToken: string,
    interestAmount: string,

    isSettled: boolean,
    purchaseFeePercentage: number,
    earlyRedemptionFeePercentage: number,

    issuanceBlock: number,
    issuanceDate: Date
    type: string,

    trending?: boolean
    score: number,
    tbv: number,
    securedPercentage: number,
    uniqueHolders: number,

    lastUpdated: Date
}

type FinancialAttributeInfo = TokenResponse & {
    amount: string
    amountClean: number,
}

type ContractEssentialFormat = {
    _id: string, // combination of contractAddress and chainId

    total: number,
    purchased: number,
    redeemed: number,
    maturityPeriod: number,

    investment: FinancialAttributeInfo,
    interest: FinancialAttributeInfo,

    issuer: string,
    issuanceDate: Date,

}

type ContractBasicFormat = ContractEssentialFormat & {
    score: number,
    tbv: number
}

type ContractDescription = {
    name: string,
    description: string,
    external_url: string,
    image: string,
    details?: {
        title: string,
        description: string
    }
}

type ContractStats = {
    score: number,
    securedPercentage: number,
    issuerScore: number,
    uniqueHolders: number,
    tbv: number
}

type ContractExtendedInfoFormat = ContractEssentialFormat & {
    isSettled: boolean,
    purchaseFeePercentage: number,
    earlyRedemptionFeePercentage: number,
    issuanceBlock: number,
}

type ContractExtendedFormat = {
    contractDescription: ContractDescription,
    contractInfo: ContractExtendedInfoFormat,
    contractStats: ContractStats,
    lastUpdated: Date
}

export type  {
    ContractEssentialFormat,
    ContractDescription,
    FinancialAttributeInfo,
    ContractQuery,
    ContractSortQuery,
    TransformDataConfig,
    ContractRawData,
    ContractBasicFormat,
    ContractExtendedFormat
}
