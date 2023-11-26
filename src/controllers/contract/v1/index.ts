import {Request, Response} from "express";
import connection from '../../../db/main'
import TokenService from "../../../modules/token";
import {chainExists, CONTRACT_TYPES} from "../../../modules/web3/constants";
import {getAddress} from "ethers";
import axios from "axios";
import s3Client from "../../../db/s3-client";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {validateSignature} from "../../../modules/address/util";
import ErrorV1 from "../../../routes/error/error";

const BUCKET_NAME = 'storage.amet.finance'

async function getBonds(req: Request, res: Response) {
    const {
        chainId,
        skip,
        limit,
        issuer,
        isTrending,
        _id
    } = req.query;

    // todo implement proper pagination
    // todo add address as well for the issuer query

    const findQuery: { [key: string]: string | number | any } = {
        type: CONTRACT_TYPES.ZcbBond
    };

    if (issuer && typeof issuer === "string") {
        findQuery.issuer = getAddress(issuer)
    }

    if (_id && Array.isArray(_id)) {
        findQuery._id = {
            "$in": _id
        }
    }

    if (isTrending) {
        findQuery.trending = true;
    }

    const bonds = await connection.db.collection(`Contract_${chainId}`)
        .find(findQuery)
        .skip(Number(skip) || 0)
        .limit(Number(limit) || 20)
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

async function updateDescription(req: Request, res: Response) {

    const {address, signature, message, title, description} = req.body;
    const {chainId, _id} = req.query;
    validateSignature(address, signature, message); // todo here can be vulnerability, as if the signature should check for the exact message


    const preChainId = Number(chainId);
    const bondContractAddress = getAddress(_id?.toString() || "").toLowerCase();

    if (!bondContractAddress) {
        ErrorV1.throw("Contract address is missing")
    }

    if (!message.includes(bondContractAddress)) {
        ErrorV1.throw("Invalid signature: PLK1")
    }

    if (!Number.isFinite(preChainId) || !chainExists(preChainId)) {
        ErrorV1.throw("Chain is missing")
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

export {
    getBonds,
    updateDescription
}
