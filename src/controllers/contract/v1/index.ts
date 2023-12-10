import {Request, Response} from "express";
import connection from '../../../db/main'
import TokenService from "../../../modules/token";
import {CONTRACT_TYPES, validateChain} from "../../../modules/web3/constants";
import {getAddress} from "ethers";
import axios from "axios";
import s3Client from "../../../db/s3-client";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import ErrorV1 from "../../../routes/error/error";
import {Sort} from "mongodb";
import ZeroCouponBondsV1 from "../../../modules/web3/zcb/v1";
import {DetailedBondResponse} from "./types";
import ContractV1Utils from "./utils";
import {BUCKET_NAME} from "./contstants";
import BondDescriptionService from "../../../modules/bond-description";


async function getBonds(req: Request, res: Response) {

    // todo implement proper pagination
    const {
        chainId,
        skip,
        limit,
        issuer,
        isTrending,
        _id
    } = req.query;

    validateChain(chainId);

    const findQuery: { [key: string]: string | number | any } = {
        type: CONTRACT_TYPES.ZcbBond
    };

    const sortQuery: Sort = {}
    if (isTrending) sortQuery.trending = -1;
    sortQuery.issuanceDate = -1

    if (issuer && typeof issuer === "string") {
        findQuery.issuer = getAddress(issuer)
    }

    if (_id && Array.isArray(_id)) {
        findQuery._id = {
            "$in": _id
        }
    }

    const bonds = await connection.db.collection(`Contract_${chainId}`)
        .find(findQuery)
        .skip(Number(skip) || 0)
        .limit(Number(limit) || 20)
        .sort(sortQuery)
        .toArray();


    const bondsDetailed = []

    for (const bond of bonds) {
        const investmentTokenInfo = await TokenService.get(Number(chainId), bond.investmentToken);
        const interestTokenInfo = await TokenService.get(Number(chainId), bond.interestToken);

        const bondInfo = {
            ...bond,
            chainId,
            investmentTokenInfo,
            interestTokenInfo
        }

        if (!bondInfo.investmentTokenInfo || !bondInfo.interestTokenInfo) {
            continue;
        }
        bondsDetailed.push(bondInfo)
    }

    return res.json({
        data: bondsDetailed
    })
}

async function getContractDetailed(req: Request, res: Response) {
    const {id} = req.params
    const {chainId} = req.query;

    const contractAddress = getAddress(`${id}`).toLowerCase();
    const parsedChain = Number(chainId);
    validateChain(chainId);


    const contractInfo = await ZeroCouponBondsV1.getContractInfo(parsedChain, contractAddress, {contractBalance: true, tokensIncluded: true})
    const description = await BondDescriptionService.getDescription(contractInfo._id);

    const response: DetailedBondResponse = {
        contractInfo,
        securityDetails: await ContractV1Utils.getSecurityDetails(contractInfo, description),
        description
    }

    return res.json(response)
}


async function updateDescription(req: Request, res: Response) {

    const {address, message, title, description} = req.body;
    const {chainId, _id} = req.query;


    const preChainId = Number(chainId);
    const bondContractAddress = getAddress(_id?.toString() || "").toLowerCase();

    validateChain(chainId);

    if (!bondContractAddress) {
        ErrorV1.throw("Contract address is missing")
    }

    if (!message.includes(bondContractAddress)) {
        ErrorV1.throw("Invalid signature: PLK1")
    }

    const contract = await connection.db.collection(`Contract_${preChainId}`).findOne({
        _id: bondContractAddress as any,
        type: CONTRACT_TYPES.ZcbBond
    })

    if (!contract) {
        ErrorV1.throw("Contract is missing");
    }

    if (contract?.issuer.toLowerCase() !== address.toLowerCase()) {
        throw Error("Invalid owner")
    }

    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${bondContractAddress}.json`)
    const preObject = response.data;

    if (!preObject.details) preObject.details = {}
    if (title) preObject.details.title = title
    if (description) preObject.details.description = description

    await s3Client.send(new PutObjectCommand(
        {
            Bucket: BUCKET_NAME,
            Key: `contracts/${bondContractAddress}.json`,
            Body: JSON.stringify(preObject),
            ContentType: "application/json",
        }
    ))

    return res.json(preObject)
}

async function report(req: Request, res: Response) {
    //todo update this one
    return res.json({})
}

const ContractControllerV1 = {
    getBonds,
    updateDescription,
    getContractDetailed,
    report
}
export default ContractControllerV1
