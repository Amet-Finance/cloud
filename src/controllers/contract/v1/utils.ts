import {BondInfoDetailed, ContractInfoOptions, Description, SecurityDetails} from "./types";
import BigNumber from "bignumber.js";
import connection from "../../../db/main";
import TokenService from "../../../modules/token";
import {getBalance} from "../../../modules/web3/token";

async function getContractInfo(chainId: number, contractAddress: string, options?: ContractInfoOptions): Promise<BondInfoDetailed> {
    const contractInfoFromDb = await connection.db.collection(`Contract_${chainId}`).findOne({
        _id: contractAddress.toLowerCase() as any
    }) as any;

    if (!contractInfoFromDb) {
        throw Error('Contract info is missing');
    }

    const {
        issuer, total,
        purchased, redeemed,
        redeemLockPeriod, investmentToken,
        investmentTokenAmount, interestToken,
        interestTokenAmount, feePercentage,
        issuanceDate, issuanceBlock
    } = contractInfoFromDb;

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
        issuanceDate: Number(issuanceDate),
        issuanceBlock: issuanceBlock || 0
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

async function getSecurityDetails(contractInfo: BondInfoDetailed, description: Description): Promise<SecurityDetails> {

    const isTotallyBought = !(contractInfo.total - contractInfo.purchased)
    const isTotallyRedeemed = !(contractInfo.purchased - contractInfo.redeemed);
    const isTotallyFinished = isTotallyBought && isTotallyRedeemed;

    if (isTotallyFinished) {
        return {
            bondScore: 0,
            issuerScore: 0,
            securedPercentage: 0,
            uniqueHolders: 0,
            uniqueHoldersIndex: 0
        }
    }

    if (!contractInfo.interestTokenBalance) {
        throw Error('Something went wrong: B11')
    }

    const {chainId, _id} = contractInfo;
    const contractAddress = _id.toLowerCase();

    const totalHolders = await connection.db.collection(`Balance_${chainId}`).countDocuments({[contractAddress]: {$exists: true}})
    const issuerInfo: any = await connection.db.collection("Address").findOne({_id: contractInfo.issuer.toLowerCase() as any})
    const issuerScore = issuerInfo?.score || 0;

    const uniqueHoldersIndex = (totalHolders / (contractInfo.purchased - contractInfo.redeemed)) || 0

    const interestToken = await TokenService.get(chainId, contractInfo.interestToken);
    const investmentToken = await TokenService.get(chainId, contractInfo.investmentToken);
    const isBothAssetsVerified = interestToken?.isVerified && investmentToken?.isVerified;
    const descriptionExists = Boolean(description.details?.description) && Boolean(description.details?.title);
    // secured redemption percentage - 0.4
    // issuer score - 0.2
    // assets are verified or not - 0.2
    // unique holder index - 0.15
    // description presence - 0.05

    const securityDetails: SecurityDetails = {
        bondScore: 0,
        issuerScore,
        securedPercentage: 0,
        uniqueHolders: totalHolders,
        uniqueHoldersIndex
    }

    const interestBalance = contractInfo.interestTokenBalance
    const interestAmount = BigNumber(contractInfo.interestTokenAmount).div(BigNumber(10).pow(BigNumber(interestBalance.decimals as any)))
    const notRedeemed = BigNumber(contractInfo.total - contractInfo.redeemed).times(interestAmount);
    const securedPercentage = (interestBalance.balanceClean * 100 / notRedeemed.toNumber()) || 0;
    securityDetails.securedPercentage = securedPercentage;


    console.log(`securityDetails`, securityDetails)
    securityDetails.bondScore = (0.4 * (securedPercentage / 10)) + (0.2 * issuerScore) + (0.2 * (isBothAssetsVerified ? 10 : 0)) + (0.15 * (uniqueHoldersIndex * 10)) + (0.05 * (descriptionExists ? 10 : 0));

    return securityDetails
}

const ContractV1Utils = {
    getContractInfo,
    getSecurityDetails
}
export default ContractV1Utils;
