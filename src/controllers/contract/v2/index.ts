import {Request, Response} from "express";
import connection from "../../../db/main";
// import {CONTRACT_TYPES, RPCsByChain} from "../../../modules/web3/constants";
import {
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
import {getIssuerScore} from "../../../modules/address";
import {CONTRACT_TYPES, RPCsByChain} from "amet-utils";

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

    // todo add purchaseToken
    // add payoutToken
    const query: ContractQuery = {
        type: CONTRACT_TYPES.FIXED_FLEX.BOND
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
        .contract
        .find(query as any)
        .sort(sortQuery as any)
        .skip(skipValue)
        .limit(limitValue)
        .toArray()
    const transformDataConfig: TransformDataConfig = {responseFormat: `${responseFormat}`}
    const data = []

    for (const contract of contractsTmp) {
        const transformedData = await transformData(contract as any, transformDataConfig)
        if (transformedData) data.push(transformedData);
    }

    return res.json({data});
}

async function transformData(contract: ContractRawData, config: TransformDataConfig) {
    try {
        if (config.responseFormat === ResponseFormats.Basic) {
            return await transformBasicData(contract)
        } else if (config.responseFormat === ResponseFormats.Extended) {
            return await transformExtendedData(contract)
        } else {
            throw Error("Unsupported response format")
        }
    } catch (error: any) {
        // console.error(error)
    }
}


async function transformEssentialData(contract: ContractRawData): Promise<ContractEssentialFormat> {
    return {
        _id: contract._id,

        issuer: contract.issuer,
        issuerScore: await getIssuerScore(contract.owner),
        uniqueHolders: contract.uniqueHolders,
        owner: contract.owner,

        totalBonds: Number(contract.totalBonds),
        purchased: Number(contract.purchased),
        redeemed: Number(contract.redeemed),

        purchase: await transformFinancialAttribute(contract, contract.purchaseToken, contract.purchaseAmount),
        payout: await transformFinancialAttribute(contract, contract.payoutToken, contract.payoutAmount),

        maturityPeriodInBlocks: Number(contract.maturityPeriodInBlocks),

        issuanceDate: new Date(contract.issuanceDate),
        issuanceBlock: contract.issuanceBlock,
        isSettled: contract.isSettled,
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

async function transformBasicData(contract: ContractRawData): Promise<ContractEssentialFormat> {
    return await transformEssentialData(contract);
}

async function transformExtendedData(contract: ContractRawData): Promise<ContractExtendedFormat> {
    return {
        contractDescription: await BondDescriptionService.get(contract._id),
        contractInfo: await transformEssentialData(contract),
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

    const contract = await connection.contract.findOne({_id: contractAddress as any})

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
