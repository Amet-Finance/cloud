import connection from '../db/main'
import {getWeb3} from "../modules/web3/utils";
import {initializeBlockInfo, updateBlock} from "./block";
import * as CacheService from "./cache";
import {getBlock} from "../modules/web3";

async function initializeBlockchainListener(chainId: number) {
    // await historicalSync() //todo add it here
    await CacheService.cache(chainId)
    return listenWithInterval(chainId);
}

async function listenWithInterval(chainId: number) {

    console.log(`Started listening to chainId: ${chainId}`)
    let lastBlockNumber = 0
    setInterval(async () => {

        const blockHeader = await getBlock(chainId, "latest")
        if (blockHeader.number > lastBlockNumber) {
            lastBlockNumber = blockHeader.number;
            await initializeBlockInfo(chainId, blockHeader);
            await updateBlock(chainId, blockHeader);
        }
    }, 1800)


}

async function historicalSync(chainId: number, fromBlock?: number, toBlock?: number) {
    try {
        console.log(`Historical blocks syncing...`)
        const web3 = getWeb3(chainId);

        if (typeof fromBlock === "undefined") {
            const chainInfo: any = await connection.db.collection('Listener').findOne({_id: chainId as any})
            fromBlock = chainInfo.lastBlock;
        }

        if (typeof toBlock === "undefined") {
            toBlock = await web3.eth.getBlockNumber()
        }

        for (let from: any = fromBlock; from <= toBlock; from++) {
            const blockHeader = await getBlock(chainId, from)
            await initializeBlockInfo(chainId, blockHeader)
        }

        console.log(`Historical blocks were synced| ${fromBlock}-${toBlock}`)
    } catch (error: any) {
        console.error(`Error while syncing historical blocks`, error.message)
    }
}

export default initializeBlockchainListener;
