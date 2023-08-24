import connection from '../../db/main'
import ZCB_ISSUER_V1 from './abi-jsons/ZCB_Issuer.json'
import ZCB_V1 from './abi-jsons/ZCB_V1.json'
import {TransactionReceipt} from 'web3-core'
import {getWeb3} from "../../modules/web3/utils";
import {CONTRACT_TYPES, DEFAULT_CHAIN, ZERO_ADDRESS} from "../constants";
import {getInfo, getTokenInfo} from "./index";

async function extractIssuer(transaction: TransactionReceipt) {
    const web3 = getWeb3();
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
                    const info = await getInfo(decodedData.contractAddress)
                    await connection.db.collection(`Contract_${DEFAULT_CHAIN}`).insertOne({
                        _id: decodedData.contractAddress.toLowerCase() as any,
                        type: CONTRACT_TYPES.ZcbBond,
                        ...info
                    })

                    const insertArray = [];
                    const investmentTokenInfo = await getTokenInfo(info.investmentToken);
                    const interestTokenInfo = await getTokenInfo(info.interestToken);

                    if (investmentTokenInfo) {
                        insertArray.push(investmentTokenInfo)
                    }
                    if (interestTokenInfo) {
                        insertArray.push(interestTokenInfo)
                    }

                    await connection.db.collection(`Token_${DEFAULT_CHAIN}`).insertMany(insertArray as any);
                }
            }
        } catch (error) {

        }
    }
}

async function extractBond(transaction: TransactionReceipt) {
    const web3 = getWeb3();
    const signatures = ZCB_V1.reduce((acc: any, item: any) => {
        if (item.name) {
            const eventSignature = web3.eth.abi.encodeEventSignature(item);
            acc[eventSignature] = {
                name: item.name,
                inputs: item.inputs
            };
        }
        return acc;
    }, {} as any)

    const balances: any = {}

    for (const log of transaction.logs) {
        try {
            const abi = signatures[log.topics[0]]
            if (abi) {
                const decodedData = web3.eth.abi.decodeLog(
                    abi.inputs,
                    log.data,
                    log.topics.slice(1)
                );

                if (abi.name === "Transfer") {
                    if (!balances[decodedData.to]) {
                        balances[decodedData.to] = {
                            add: [],
                            remove: []
                        }
                    }

                    if (!balances[decodedData.from]) {
                        balances[decodedData.from] = {
                            add: [],
                            remove: []
                        }
                    }


                    if (decodedData.to !== ZERO_ADDRESS) {
                        balances[decodedData.to].add.push(decodedData.tokenId);
                    }

                    if (decodedData.from !== ZERO_ADDRESS) {
                        balances[decodedData.from].remove.push(decodedData.tokenId);
                    }

                }
            }
        } catch (error) {

        }
}

//
// for (const address in balances) {
//     const {add, remove} = balances[address];
//
//     await connection.db.collection(`Balance_${DEFAULT_CHAIN}`).updateOne({
//         _id: address.toLowerCase() as any
//     }, {
//         $push: {
//             [transaction.to.toLowerCase()]: {
//                 $each: add
//             }
//         },
//     }, {
//         upsert: true
//     })
// }

}

export {
    extractIssuer,
    extractBond
}