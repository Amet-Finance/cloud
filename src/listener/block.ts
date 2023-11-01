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


        // todo if you receive transaction related to bond, it is better to call getInfo() and update in database!
    } catch (error: any) {
        console.error(`Error in BlockInitializer ${blockInfo.number}`, error)
        await sleep(1500);
        return initializeBlockInfo(chainId, blockInfo)
    }
}

async function updateBlock(chainId: number, block: BlockHeader) {
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

}

export {
    initializeBlockInfo,
    updateBlock
}
