import {BondInfoDetailed} from "../../../modules/web3/zcb/v1/types";

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
    Description
}
