type UserGeneralStatsShort = {
    id: string;
};

type BondIssuerDetail = {
    issuer: UserGeneralStatsShort;
};

type BondSettledDetails = {
    isSettled: boolean
}

type BondPurchasePayoutDetail = {
    payoutToken: {
        id: string;
    };
    purchaseToken: {
        id: string;
    };
    purchaseAmount: string;
    payoutAmount: string;
    payoutBalance: string;
};

type BondGeneralStatsShort = BondPurchasePayoutDetail & {
    id: string;
    purchased: string;
    redeemed: string;
};

type ActionLogForXP = {
    from: string;
    to: string;
    count: string;
    bond: BondPurchasePayoutDetail;
};

export type {
    BondGeneralStatsShort,
    UserGeneralStatsShort,
    BondSettledDetails,
    ActionLogForXP,
    BondIssuerDetail,
};
