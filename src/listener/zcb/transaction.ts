import connection from '../../db/main'
import ZCB_ISSUER_V1 from './abi-jsons/ZCB_Issuer.json'
import ZCB_V1 from './abi-jsons/ZCB_V1.json'
import {TransactionReceipt} from 'web3-core'
import {getWeb3} from "../../modules/web3/utils";
import {CONTRACT_TYPES, ZERO_ADDRESS} from "../constants";
import {getInfo} from "./index";
import {updateTokens} from "./token";
import {AnyBulkWriteOperation} from "mongodb";

async function extractIssuer(chainId: number, transaction: TransactionReceipt) {
    const web3 = getWeb3(chainId);
    const signatures = ZCB_ISSUER_V1.reduce((acc: any, item: any) => {
        if (item.name) {
            const eventSignature = web3.eth.abi.encodeEventSignature(item);
            acc[eventSignature] = {
                name: item.name,
                inputs: item.inputs
            };
        }
        return acc;
    }, {} as any)

    for (const log of transaction.logs) {
        try {
            const abi = signatures[log.topics[0]]
            if (abi) {
                const decodedData = web3.eth.abi.decodeLog(
                    abi.inputs,
                    log.data,
                    log.topics.slice(1)
                );

                if (abi.name === "Create") {
                    const info = await getInfo(chainId, decodedData.contractAddress)
                    await connection.db.collection(`Contract_${chainId}`).insertOne({
                        type: CONTRACT_TYPES.ZcbBond,
                        ...info,
                        _id: decodedData.contractAddress.toLowerCase() as any,
                    })

                    // todo here add a META INFO to S3

                    await updateTokens(chainId, [info.investmentToken, info.interestToken])
                }
            }
        } catch (error) {
            console.error(`Error while extracting`, error)
        }
    }

    console.log(`Contract inserted to: ${chainId}`)
}

async function extractBond(chainId: number, transaction: TransactionReceipt) {
    const web3 = getWeb3(chainId);
    const signatures = ZCB_V1.reduce((acc: any, item: any) => {
        if (item.name) {
            const eventSignature = web3.eth.abi.encodeEventSignature(item);
            acc[eventSignature] = {
                name: item.name,
                inputs: item.inputs
            };
        }
        return acc;
    }, {} as any);
    const contractAddress = transaction.to.toLowerCase();

    const balances: { [key: string]: { add: any, remove: any } } = {}

    for (const log of transaction.logs) {
        try {
            const abi = signatures[log.topics[0]]
            if (abi) {
                const decodedData = web3.eth.abi.decodeLog(
                    abi.inputs,
                    log.data,
                    log.topics.slice(1)
                );

                const tokenId = decodedData.tokenId;
                const fromAddress = decodedData.from?.toLowerCase();
                const toAddress = decodedData.to?.toLowerCase()

                if (abi.name === "Transfer") {
                    if (!balances[toAddress]) {
                        balances[toAddress] = {
                            add: {},
                            remove: {}
                        }
                    }

                    if (!balances[fromAddress]) {
                        balances[fromAddress] = {
                            add: {},
                            remove: {}
                        }
                    }


                    if (toAddress) {
                        balances[toAddress].add[tokenId] = true
                    }

                    if (fromAddress) {
                        balances[fromAddress].remove[tokenId] = true
                    }
                }
            }
        } catch (error) {

        }
    }

    delete balances[ZERO_ADDRESS];

    const contractInfo = await getInfo(chainId, contractAddress)
    await connection.db.collection(`Contract_${chainId}`).updateOne({
        _id: contractAddress.toLowerCase() as any
    }, {
        $set: {
            issuer: contractInfo.issuer,
            redeemLockPeriod: contractInfo.redeemLockPeriod,
            total: contractInfo.total,
            purchased: contractInfo.purchased,
            redeemed: contractInfo.redeemed,
            feePercentage: contractInfo.feePercentage,
        }
    })

    if (Object.keys(balances)) {

        const addressBalancesDb = await connection.db
            .collection(`Balance_${chainId}`)
            .find({
                _id: {
                    $in: Object.keys(balances) as any
                }
            })
            .toArray();

        const addressBalances = addressBalancesDb.reduce((acc: any, item: any) => {
            const address = item._id.toLowerCase();
            if (item[contractAddress]) {
                acc[address] = item[contractAddress];
            }
            return acc;
        }, {} as any)

        const response: any[] = [];

        for (const address in balances) {
            const object: AnyBulkWriteOperation = {
                updateOne: {
                    filter: {
                        _id: address.toLowerCase() as any
                    },
                    update: {},
                    upsert: true
                }
            }


            const {add, remove} = balances[address];
            const historicalTokenIds = addressBalances[address] || [];

            const concatenatedTokenIds = Array.from(new Set([...historicalTokenIds, ...Object.keys(add)]))
            const totalTokenIds = []

            for (const tokenId of concatenatedTokenIds) {
                if (!remove[tokenId]) {
                    totalTokenIds.push(tokenId)
                }
            }

            if (!totalTokenIds.length) { // if no length, then unset it from db
                object.updateOne.update = {
                    $unset: {
                        [contractAddress]: 1
                    }
                }
            } else {
                object.updateOne.update = {
                    $set: {
                        [contractAddress]: totalTokenIds
                    }
                }
            }


            response.push(object);
        }


        if (response.length) {
            await connection.db.collection(`Balance_${chainId}`).bulkWrite(response);
        }
    }

    console.log(`Contract interaction| chainId: ${chainId}| contract: ${transaction.to}`)
}

export {
    extractIssuer,
    extractBond
}
