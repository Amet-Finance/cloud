import connection from '../db/main'
import {BlockHeader} from "web3-eth";
import {getBlock} from "../modules/web3";
import * as TransactionService from './transaction';
import {sleep} from "../modules/utils/dates";

async function init(chainId: string, block: BlockHeader) {
    try {
        console.log(`Block: ${block.number}`)
        // sleep in order to have the most up-to-date data in def rpc's
        await sleep(1500);


        const blockInfo = await getBlock(chainId, block.number)

        await updateBlock(chainId, block); // todo use this data as well

        for (const transaction of blockInfo.transactions) {
            await TransactionService.extractTransaction(chainId, transaction);
        }
    } catch (error: any) {
        console.error(`Error in BlockInitializer`, error)
    }
}

async function updateBlock(chainId: string, block: BlockHeader) {
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

export default init;