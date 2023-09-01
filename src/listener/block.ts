import connection from '../db/main'
import {BlockHeader} from "web3-eth";
import {getBlock} from "../modules/web3";
import * as TransactionService from './transaction';
import {DEFAULT_CHAIN} from "./constants";

async function init(block: BlockHeader) {
    const blockInfo = await getBlock(block.number)

    await updateBlock(block);

    for (const transaction of blockInfo.transactions) {
        await TransactionService.extractTransaction(transaction);
    }
}

async function updateBlock(block: BlockHeader) {
    if (block.number % 10 === 0) {
        await connection.db.collection(`ListenerInfo`).updateOne({
            _id: DEFAULT_CHAIN as any
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