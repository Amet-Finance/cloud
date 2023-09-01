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
            console.error(`Error while extracting`, error)
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

    const zeroBalance = balances[ZERO_ADDRESS];
    if (zeroBalance) {

        const updateQuery: any = {};
        const removeQty = Object.keys(zeroBalance.remove).length
        if (removeQty) {
            updateQuery["$inc"] = {
                purchased: removeQty
            }
        }

        const addQty =  Object.keys(zeroBalance.add).length;
        if (addQty) {
            updateQuery["$inc"] = {
                ...(updateQuery["$inc"] || {}),
                redeemed: addQty
            }
        }

        if (Object.keys(updateQuery).length) {
            await connection.db.collection(`Contract_${DEFAULT_CHAIN}`).updateOne({
                _id: contractAddress.toLowerCase() as any
            }, updateQuery)
        }

        delete balances[ZERO_ADDRESS];
    }


    if (Object.keys(balances)) {

        const addressBalancesDb = await connection.db
            .collection(`Balance_${DEFAULT_CHAIN}`)
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
            const {add, remove} = balances[address];
            const addressLower = address.toLowerCase()
            const historicalTokenIds = addressBalances[address] || [];

            const concated = [...historicalTokenIds, ...Object.keys(add)];
            for (const tokenId in remove) {
                const index = concated.indexOf(tokenId);
                if (index !== -1) {
                    concated.splice(index, 1);
                }
            }

            const object = {
                updateOne: {
                    filter: {
                        _id: addressLower
                    },
                    update: {
                        $set: {
                            [contractAddress]: concated
                        }
                    },
                    upsert: true
                }
            }


            response.push(object);
        }


        if (response.length) {
            await connection.db.collection(`Balance_${DEFAULT_CHAIN}`).bulkWrite(response);
        }
    }
}

export {
    extractIssuer,
    extractBond
}