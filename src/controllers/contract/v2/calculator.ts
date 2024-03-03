import BigNumber from "bignumber.js";
import TokenService from "../../../modules/token";
import {ContractRawData} from "./types";
import {getBalance} from "../../../modules/web3/token";

async function securedPercentage(contract: ContractRawData) {
    const {_id} = contract;
    const [contractAddress, chainId] = _id.split("_");


    const payoutToken = await TokenService.get(chainId, contract.payoutToken)
    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken)
    if (!purchaseToken || !payoutToken) return 0;

    const payoutBalance = contract.payoutBalance || (await getBalance(chainId, payoutToken.contractAddress, contractAddress, payoutToken.decimals)).balance;
    const payoutAmount = BigNumber(contract.payoutAmount).div(BigNumber(10).pow(BigNumber(payoutToken.decimals)))
    const payoutBalanceClean = BigNumber(payoutBalance.toString()).div(BigNumber(10).pow(BigNumber(payoutToken.decimals))).toNumber()

    const notRedeemed = BigNumber(contract.totalBonds - contract.redeemed).times(payoutAmount).toNumber();
    const securedTmp = payoutBalanceClean * 100 / notRedeemed
    return Math.min(Number.isFinite(securedTmp) ? securedTmp : 0, 100);
}

const CalculatorController = {
    securedPercentage
}

export default CalculatorController;
