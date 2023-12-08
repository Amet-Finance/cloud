import {Description, SecurityDetails} from "./types";
import BigNumber from "bignumber.js";
import {BondInfoDetailed} from "../../../modules/web3/zcb/v1/types";
import connection from "../../../db/main";
import axios from "axios";
import {BUCKET_NAME} from "./contstants";
import TokenService from "../../../modules/token";

async function getSecurityDetails(contractInfo: BondInfoDetailed, description: Description): Promise<SecurityDetails> {

    if (!contractInfo.interestTokenBalance) {
        throw Error('Something went wrong: B11')
    }

    const {chainId, _id} = contractInfo;
    const contractAddress = _id.toLowerCase();

    const totalHolders = await connection.db.collection(`Balance_${chainId}`).countDocuments({[contractAddress]: {$exists: true}})
    const issuerInfo: any = await connection.db.collection("Address").findOne({_id: contractInfo.issuer.toLowerCase() as any})
    const issuerScore = issuerInfo.score || 0;

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


    securityDetails.bondScore = (0.4 * (securedPercentage / 10)) + (0.2 * issuerScore) + (0.2 * (isBothAssetsVerified ? 10 : 0)) + (0.15 * (uniqueHoldersIndex * 10)) + (0.05 * (descriptionExists ? 10 : 0));

    return securityDetails
}

async function getDescription(contractInfo: BondInfoDetailed): Promise<Description> {
    const bondContractAddress = contractInfo._id.toLowerCase();
    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${bondContractAddress}.json`)
    return response.data;
}

const ContractV1Utils = {
    getSecurityDetails,
    getDescription
}
export default ContractV1Utils;
