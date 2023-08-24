import {BlockHeader} from "web3-eth";
import {getBlock} from "../modules/web3";
import {getContract} from "./cache";
import * as TransactionService from './transaction';

async function init(block: BlockHeader) {
    const blockInfo = await getBlock(block.number)

    for (const transaction of blockInfo.transactions) {
        await TransactionService.extractTransaction(transaction);
    }
}

export default init;