import connection from '../db/main'
import {BlockHeader} from "web3-eth";
import {getBlock} from "../modules/web3";
import * as TransactionService from './transaction';
import {sleep} from "../modules/utils/dates";

async function init(chainId: number, block: BlockHeader): Promise<any> {
    try {
        if (block.number % 10 === 0) {
            console.log(`Block: ${block.number}`)
        }

        // sleep in order to have the most up-to-date data in def rpc's
        await sleep(2000);

        const blockInfo = await getBlock(chainId, block.number)

        for (const transaction of blockInfo.transactions) {
            await TransactionService.extractTransaction(chainId, transaction);
        }


        // todo if you receive transaction related to bond, it is better to call getInfo() and update in database!
    } catch (error: any) {
        console.error(`Error in BlockInitializer ${block.number}`, error)
        await sleep(1500);
        return init(chainId, block)
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

export default init;

export {
    updateBlock
}
