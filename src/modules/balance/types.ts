type BalanceRawData = { _id: string } & { [contractId: string]: { [tokenId: string]: number } }

export type {
    BalanceRawData
}
