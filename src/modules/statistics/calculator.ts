import BigNumber from 'bignumber.js';
import TokenService from '../token';
import { BondGeneralStatsShort } from '../api/type';

async function tbv(chainId: number, contract: BondGeneralStatsShort) {
    const payoutToken = await TokenService.get(chainId, contract.payoutToken.id);
    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken.id);
    if (!purchaseToken || !payoutToken) return 0;

    const purchaseAmountClean = BigNumber(contract.purchaseAmount)
        .div(BigNumber(10).pow(BigNumber(purchaseToken.decimals)))
        .toNumber();
    const payoutAmountClean = BigNumber(contract.payoutAmount)
        .div(BigNumber(10).pow(BigNumber(payoutToken.decimals)))
        .toNumber();
    return (
        Number(contract.purchased) * purchaseAmountClean * (purchaseToken.priceUsd ?? 0) +
        Number(contract.redeemed) * payoutAmountClean * (payoutToken.priceUsd ?? 0)
    );
}

async function tvl(chainId: number, contract: BondGeneralStatsShort) {
    const payoutToken = await TokenService.get(chainId, contract.payoutToken.id);
    if (!payoutToken) return 0;

    const payoutBalanceClean = BigNumber(contract.payoutBalance)
        .div(BigNumber(10).pow(BigNumber(payoutToken.decimals)))
        .toNumber();
    return payoutBalanceClean * (payoutToken.priceUsd ?? 0);
}

const CalculatorController = {
    tbv,
    tvl,
};

export default CalculatorController;
