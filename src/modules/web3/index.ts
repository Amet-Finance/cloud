import {getWeb3} from "./utils";
import {BlockTransactionObject} from "web3-eth";
import {sleep} from "../utils/dates";

async function getBlock(number: number, isFallback?: boolean): Promise<BlockTransactionObject> {
    try {
        const web3 = getWeb3(false, isFallback);
        const blockInfo = await web3.eth.getBlock(number, true);
        return blockInfo;
    } catch (error) {
        await sleep(1000);
        return getBlock(number, true);
    }
}

export {
    getBlock
}