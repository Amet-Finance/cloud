import connection from '../../db/main';
import TokenService from '../../modules/token';
import BigNumber from 'bignumber.js';
import GraphqlAPI from '../../modules/api/graphql';
import CalculatorController from '../../modules/statistics/calculator';
import { SUPPORTED_CHAINS } from '../../constants';


export default async function updateGeneralStats() {
    const generalStats = {
        issued: 0,
        volume: 0,
        purchased: 0,
        redeemed: 0,
        activeUsers: 0,
        maxReturn: 0,
        realisedGains: 0,
        tvl: 0,
    };

    for (const chainId of SUPPORTED_CHAINS) {
        const { bonds, users } = await GraphqlAPI.getDataForGeneralStatistics(chainId);

        generalStats.issued += bonds.length;
        generalStats.activeUsers += users.length;

        for (const bond of bonds) {
            generalStats.purchased += Number(bond.purchased);
            generalStats.redeemed += Number(bond.redeemed);
            generalStats.volume += await CalculatorController.tbv(chainId, bond);

            const currentTvl = await CalculatorController.tvl(chainId, bond);
            generalStats.tvl += currentTvl;

            const purchaseToken = await TokenService.get(chainId, bond.purchaseToken.id);
            const payoutToken = await TokenService.get(chainId, bond.payoutToken.id);

            if (purchaseToken && payoutToken) {
                const purchaseAmountClean = BigNumber(bond.purchaseAmount).div(BigNumber(10).pow(BigNumber(purchaseToken.decimals)));
                const purchaseTotal = purchaseAmountClean.times(purchaseToken.priceUsd ?? 0).toNumber();

                const payoutAmountClean = BigNumber(bond.payoutAmount).div(BigNumber(10).pow(BigNumber(payoutToken.decimals)));
                const payoutTotal = payoutAmountClean.times(payoutToken.priceUsd ?? 0).toNumber();

                const currentReturn = payoutTotal / purchaseTotal || 0;
                if (currentReturn > generalStats.maxReturn) {
                    generalStats.maxReturn = currentReturn;
                }

                if (payoutToken.priceUsd && purchaseToken.priceUsd) {
                    const gain = payoutAmountClean.toNumber() * payoutToken.priceUsd - purchaseAmountClean.toNumber() * purchaseToken.priceUsd;
                    generalStats.realisedGains += Number(bond.redeemed) * gain;
                }
            }
        }
    }

    await connection.general.updateOne(
        {
            _id: 'general-stats' as any,
        },
        {
            $set: generalStats,
        },
        { upsert: true },
    );
}
