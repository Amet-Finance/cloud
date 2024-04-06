type BondGeneralStatsShort = {
    "id": string,
    "payoutToken": {
        "id": string
    },
    "purchaseToken": {
        "id": string
    },
    "purchased": string,
    "redeemed": string,
    purchaseAmount: string
    payoutAmount: string
}

type UserGeneralStatsShort = {
    id: string
}

export type {
    BondGeneralStatsShort,
    UserGeneralStatsShort
}
