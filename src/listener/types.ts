type Contract = {
    _id: string,
    type: string
}

type BondInfo = {
    _id: string,
    issuer: string,
    total: number,
    purchased: number,
    redeemed: number,
    redeemLockPeriod: number,
    investmentToken: string,
    investmentTokenAmount: string,
    interestToken: string,
    interestTokenAmount: string,
    feePercentage: number,
    issuanceDate: number
}

export {
    Contract,
    BondInfo
}
