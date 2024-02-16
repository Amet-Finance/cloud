import {Request, Response} from "express";
import connection from "../../../db/main";
import {CONTRACT_TYPES, RPCsByChain} from "../../../modules/web3/constants";
import {
    ContractBasicFormat,
    ContractEssentialFormat,
    ContractExtendedFormat,
    ContractQuery,
    ContractRawData,
    ContractSortQuery,
    FinancialAttributeInfo,
    TransformDataConfig
} from "./types";
import {BUCKET_NAME, ResponseFormats} from "./constants";
import TokenService from "../../../modules/token";
import BigNumber from "bignumber.js";
import BondDescriptionService from "../../../modules/bond-description";
import ErrorV1 from "../../../routes/error/error";
import axios from "axios";
import s3Client from "../../../db/s3-client";
import {PutObjectCommand} from "@aws-sdk/client-s3";

async function getBonds(req: Request, res: Response) {
    const {
        skip,
        limit,
        chainId,
        responseFormat, // basic or extended
        contractAddresses,
        trending,
        sortByBondScore
    } = req.query;

    const query: ContractQuery = {
        type: CONTRACT_TYPES.ZcbBond
    }
    const sortQuery: ContractSortQuery = {}

    const skipValue = Number(skip) || 0
    const limitValue = Number(limit) || 50

    if (chainId) {
        const chainIdInt = Number(chainId)
        const chainExists = RPCsByChain[chainIdInt]
        if (!chainExists) {
            throw Error('Chain is not supported');
        }

        query.chainId = chainIdInt;
    }

    // if (type) {
    //     if (type === CONTRACT_TYPES.ZcbBond) {
    //         query.type = CONTRACT_TYPES.ZcbBond
    //     } else if (type === CONTRACT_TYPES.ZcbIssuer) {
    //         query.type = CONTRACT_TYPES.ZcbIssuer
    //     } else {
    //         throw Error("Contract type is not supported")
    //     }
    // }

    if (contractAddresses) {
        const contractIds = JSON.parse(`${contractAddresses}`)
        const contractIdsMapped = contractIds.map((id: string) => (id.includes("_") ? id : `${id}_${chainId}`).toLowerCase())
        query._id = {
            $in: contractIdsMapped
        }
    }

    if (trending) {
        query.trending = true
    }

    if (sortByBondScore) {
        sortQuery.score = sortByBondScore.toString() === "asc" ? 1 : -1
    }

    const contractsTmp = await connection
        .db.collection("Contract")
        .find(query as any)
        .sort(sortQuery as any)
        .skip(skipValue)
        .limit(limitValue)
        .toArray()
    const transformDataConfig: TransformDataConfig = {responseFormat: `${responseFormat}`}
    const data = []

    for (const contract of contractsTmp) {
        const transformedData = await transformData(contract as any, transformDataConfig)
        data.push(transformedData);
    }

    return res.json({data});
}

function transformData(contract: ContractRawData, config: TransformDataConfig) {
    if (config.responseFormat === ResponseFormats.Basic) {
        return transformBasicData(contract)
    } else if (config.responseFormat === ResponseFormats.Extended) {
        return transformExtendedData(contract)
    } else {
        throw Error("Unsupported response format")
    }
}


async function transformEssentialData(contract: ContractRawData): Promise<ContractEssentialFormat> {
    return {
        _id: contract._id,
        total: Number(contract.total),
        purchased: Number(contract.purchased),
        redeemed: Number(contract.redeemed),
        investment: await transformFinancialAttribute(contract, contract.investmentToken, contract.investmentAmount),
        interest: await transformFinancialAttribute(contract, contract.interestToken, contract.interestAmount),
        issuer: contract.issuer,
        maturityPeriod: Number(contract.maturityPeriod),
        issuanceDate: new Date(contract.issuanceDate),
    }
}

async function transformFinancialAttribute(contract: ContractRawData, contractAddress: string, amount: string): Promise<FinancialAttributeInfo> {
    const token = await TokenService.get(contract.chainId, contractAddress, {});
    if (!token) throw Error("Token is not found");

    return {
        ...token,
        amount: amount,
        amountClean: Number.isFinite(token?.decimals) ? BigNumber(amount).div(BigNumber(10).pow(BigNumber(token?.decimals || 0))).toNumber() : 0,
    }
}

async function transformBasicData(contract: ContractRawData): Promise<ContractBasicFormat> {
    return {
        ...(await transformEssentialData(contract)),
        score: contract.score || 0,
        tbv: contract.tbv || 0
    }
}

async function transformExtendedData(contract: ContractRawData): Promise<ContractExtendedFormat> {
    const [contractAddress, chainId] = contract._id.split("_")
    const issuerInfo = await connection.db.collection("Address").findOne({_id: contract.issuer.toLowerCase() as any})

    return {
        contractDescription: {
            ...(await BondDescriptionService.get(contract._id))
        },
        contractInfo: {
            ...(await transformEssentialData(contract)),
            isSettled: contract.isSettled,
            purchaseFeePercentage: contract.purchaseFeePercentage,
            earlyRedemptionFeePercentage: contract.earlyRedemptionFeePercentage,
            issuanceBlock: contract.issuanceBlock,
        },
        contractStats: {
            score: contract.score || 0,
            securedPercentage: contract.securedPercentage || 0,
            issuerScore: issuerInfo?.score || 0,
            uniqueHolders: contract.uniqueHolders || 0,
            tbv: contract.tbv || 0
        },
        lastUpdated: contract.lastUpdated
    }
}


async function updateDescription(req: Request, res: Response) {

    const {address, message, title, description, _id} = req.body;


    const contractAddress = (_id || "").toString().toLowerCase();

    if (!contractAddress) {
        ErrorV1.throw("Contract address is missing")
    }

    if (!message.includes(contractAddress)) {
        ErrorV1.throw("Invalid signature: PLK1")
    }

    const contract = await connection.db.collection(`Contract`).findOne({_id: contractAddress as any})

    if (!contract) {
        ErrorV1.throw("Contract is missing");
    }

    if (contract?.issuer.toLowerCase() !== address.toLowerCase()) {
        throw Error("Invalid owner")
    }

    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${contractAddress}.json`)
    const preObject = response.data;

    if (!preObject.details) preObject.details = {}
    if (title) preObject.details.title = title
    if (description) preObject.details.description = description

    await s3Client.send(new PutObjectCommand(
        {
            Bucket: BUCKET_NAME,
            Key: `contracts/${contractAddress}.json`,
            Body: JSON.stringify(preObject),
            ContentType: "application/json",
        }
    ))

    BondDescriptionService.update(contractAddress, preObject);
    return res.json(preObject)
}


const ContractControllerV2 = {
    getBonds,
    updateDescription
}
export default ContractControllerV2;
