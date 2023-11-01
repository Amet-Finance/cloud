import connection from '../db/main'
import {BlockHeader, BlockTransactionObject} from "web3-eth";
import * as TransactionService from './transaction';
import {sleep} from "../modules/utils/dates";

async function initializeBlockInfo(chainId: number, blockInfo: BlockTransactionObject): Promise<any> {
    try {
        if (blockInfo.number % 10 === 0) {
            console.log(`Block: ${blockInfo.number}`)
        }

        // sleep in order to have the most up-to-date data in def rpc's
        await sleep(2000);

        for (const transaction of blockInfo.transactions) {
            await TransactionService.extractTransaction(chainId, transaction);
        }

    } catch (error: any) {
        console.error(`Error in BlockInitializer ${blockInfo.number}`, error)
        await sleep(1500);
        return initializeBlockInfo(chainId, blockInfo)
    }
}

async function updateBlock(chainId: number, block: BlockHeader): Promise<void> {
    try {
        if (block.number % 10 === 0) {
            await connection.db.collection(`Listener`).updateOne({
                _id: chainId as any
            }, {
                $set: {
                    lastBlock: block.number
                }
            }, {
                upsert: true
            })
        }
    } catch (error: any) {
        console.error(`updateBlock`, block.number);
        await sleep(1500);
        return updateBlock(chainId, block);
    }
}

export {
    initializeBlockInfo,
    updateBlock
}
