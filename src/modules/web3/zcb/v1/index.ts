import {BondInfoDetailed, ContractInfoOptions} from "./types";
import {getProvider} from "../../utils";
import {ethers} from "ethers";
import ZeroCouponBondsV1_AmetFinance
    from './abi/contracts_zcb-v1_ZeroCouponBondsV1_AmetFinance_sol_ZeroCouponBondsV1_AmetFinance.json'
import {getBalance} from "../../token";
import TokenService from "../../../token";

function getContract(chainId: number, contractAddress: string) {
    const provider = getProvider(chainId);
    return new ethers.Contract(contractAddress, ZeroCouponBondsV1_AmetFinance, provider);
}

async function getContractInfo(chainId: number, contractAddress: string, options?: ContractInfoOptions): Promise<BondInfoDetailed> {
    const contract = getContract(chainId, contractAddress);
    const info = await contract.getInfo();

    const [
        issuer, total,
        purchased, redeemed,
        redeemLockPeriod, investmentToken,
        investmentTokenAmount, interestToken,
        interestTokenAmount, feePercentage,
        issuanceDate
    ] = Object.values(info) as any;

    const response: BondInfoDetailed = {
        _id: contractAddress,
        chainId: chainId,
        issuer: issuer,
        total: Number(total),
        purchased: Number(purchased),
        redeemed: Number(redeemed),
        redeemLockPeriod: Number(redeemLockPeriod),
        investmentToken: investmentToken,
        investmentTokenAmount: investmentTokenAmount.toString(),
        interestToken: interestToken,
        interestTokenAmount: interestTokenAmount.toString(),
        feePercentage: Number(feePercentage),
        issuanceDate: Number(issuanceDate)
    };

    if (options?.contractBalance) {
        response.interestTokenBalance = await getBalance(chainId, interestToken, contractAddress);
    }

    if (options?.tokensIncluded) {
        const interestToken = await TokenService.get(chainId, response.interestToken);
        const investmentToken = await TokenService.get(chainId, response.investmentToken);
        if (interestToken) response.interestTokenInfo = interestToken
        if (investmentToken) response.investmentTokenInfo = investmentToken
    }

    return response;
}

const ZeroCouponBondsV1 = {
    getContractInfo
}

export default ZeroCouponBondsV1;
