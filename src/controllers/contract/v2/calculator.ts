import BigNumber from "bignumber.js";
import TokenService from "../../../modules/token";
import {ContractRawData} from "./types";
import {getBalance} from "../../../modules/web3/token";
import {getIssuerScore} from "../../../modules/address";

async function tbv(contract: ContractRawData) {
    const {_id} = contract;
    const [_, chainId] = _id.split("_");


    const payoutToken = await TokenService.get(chainId, contract.payoutToken)
    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken)
    if (!purchaseToken || !payoutToken) return 0;

    const purchaseAmountClean = BigNumber(contract.purchaseAmount).div(BigNumber(10).pow(BigNumber(purchaseToken.decimals))).toNumber()
    const payoutAmountClean = BigNumber(contract.payoutAmount).div(BigNumber(10).pow(BigNumber(payoutToken.decimals))).toNumber()
    return ((contract.purchased * purchaseAmountClean) * (purchaseToken.priceUsd || 0)) + (contract.redeemed * payoutAmountClean * (payoutToken.priceUsd || 0))
}


async function score(contract: ContractRawData, issuerScore?: number) {
    const {_id} = contract;
    const [contractAddress, chainId] = _id.split("_");

    const payoutToken = await TokenService.get(chainId, contract.payoutToken)
    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken)
    const isBothAssetsVerified = payoutToken?.isVerified && purchaseToken?.isVerified;

    const uniqueHoldersIndex = contract.uniqueHolders ? contract.uniqueHolders / contract.totalBonds : 0;
    const securedPercentage = await CalculatorController.securedPercentage(contract, true)

    if (!Number.isFinite(issuerScore) || issuerScore === undefined) {
        issuerScore = await getIssuerScore(contract.issuer);
    }

    return (0.45 * (securedPercentage / 10)) + (0.3 * issuerScore) + (0.05 * (isBothAssetsVerified ? 10 : 0)) + (0.2 * (uniqueHoldersIndex * 10));
}

async function securedPercentage(contract: ContractRawData, includeMin?: boolean) {
    const {_id} = contract;
    const [contractAddress, chainId] = _id.split("_");


    const payoutToken = await TokenService.get(chainId, contract.payoutToken)
    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken)
    if (!purchaseToken || !payoutToken) return 0;

    const payoutBalance = contract.payoutBalance || (await getBalance(chainId, payoutToken.contractAddress, contractAddress, payoutToken.decimals)).balance;
    const payoutAmount = BigNumber(contract.payoutAmount).div(BigNumber(10).pow(BigNumber(payoutToken.decimals)))
    const payoutBalanceClean = BigNumber(payoutBalance.toString()).div(BigNumber(10).pow(BigNumber(payoutToken.decimals))).toNumber()

    const notRedeemed = BigNumber(contract.totalBonds - contract.redeemed).times(payoutAmount).toNumber();
    if (!notRedeemed) return 0; // this means all the bonds were purchased and redeemed

    const securedTmp = payoutBalanceClean * 100 / notRedeemed
    if (includeMin) {
        return Math.min(Number.isFinite(securedTmp) ? securedTmp : 0, 100);
    }

    return securedTmp;
}

const CalculatorController = {
    tbv,
    score,
    securedPercentage
}

export default CalculatorController;
