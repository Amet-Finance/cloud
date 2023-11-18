import connection from '../../db/main'
import ZCB_ISSUER_V1 from './abi-jsons/ZCB_Issuer.json'
import ZCB_V1 from './abi-jsons/ZCB_V1.json'
import {TransactionReceipt} from 'web3-core'
import {getWeb3} from "../../modules/web3/utils";
import {CONTRACT_TYPES, ZERO_ADDRESS} from "../constants";
import {getInfo} from "./index";
import {AnyBulkWriteOperation} from "mongodb";
import Web3 from "web3";
import {updateContractMetaInfo} from "../../modules/metadata/contract";
import TokenService from "../../modules/token";

const ZCB_ISSUER_SIGNATURES = ZCB_ISSUER_V1.reduce((acc: any, item: any) => {
    const web3 = new Web3()
    if (item.name) {
        const eventSignature = web3.eth.abi.encodeEventSignature(item);
        acc[eventSignature] = {
            name: item.name,
            inputs: item.inputs
        };
    }
    return acc;
}, {} as any)
const ZCB_SIGNATURES = ZCB_V1.reduce((acc: any, item: any) => {
    const web3 = new Web3();
    if (item.name) {
        const eventSignature = web3.eth.abi.encodeEventSignature(item);
        acc[eventSignature] = {
            name: item.name,
            inputs: item.inputs
        };
    }
    return acc;
}, {} as any);

async function extractIssuer(chainId: number, transaction: TransactionReceipt) {
    const web3 = getWeb3(chainId);

    for (const log of transaction.logs) {
        try {
            const abi = ZCB_ISSUER_SIGNATURES[log.topics[0]]
            if (abi) {
                const decodedData = web3.eth.abi.decodeLog(
                    abi.inputs,
                    log.data,
                    log.topics.slice(1)
                );

                if (abi.name === "Create") {
                    await insertNewContract(chainId, decodedData)
                }
            }
        } catch (error: any) {
            console.error(`Error while extracting`, error.message)
        }
    }
}

async function extractBond(chainId: number, transaction: TransactionReceipt) {
    try {
        const web3 = getWeb3(chainId);
        const contractAddress = transaction.to.toLowerCase();

        const balances: { [key: string]: { add: any, remove: any } } = {}

        for (const log of transaction.logs) {
            try {
                const abi = ZCB_SIGNATURES[log.topics[0]]
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
    } catch (error: any) {
        console.error(`extractBond| ${chainId} | hash: ${transaction.transactionHash}`, error.message)
    }
}


async function insertNewContract(chainId: number, decodedData: any) {
    const info = await getInfo(chainId, decodedData.contractAddress)

    const bondInfo = {
        type: CONTRACT_TYPES.ZcbBond,
        ...info,
        _id: decodedData.contractAddress.toLowerCase()
    }

    await connection.db.collection(`Contract_${chainId}`).insertOne(bondInfo)
    await TokenService.getMultiple(chainId, [info.investmentToken, info.interestToken])

    await updateContractMetaInfo(chainId, bondInfo)
    console.log(`Contract inserted to: ${chainId}`)

}

export {
    extractIssuer,
    extractBond
}
