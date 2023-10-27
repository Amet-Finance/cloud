import connection from '../db/main'
import {getWeb3} from "../modules/web3/utils";
import BlockInitializer, {updateBlock} from "./block";
import * as CacheService from "./cache";

async function init(chainId: string) {
    // await historicalSync() //todo add it here
    await CacheService.cache(chainId)
    return listen(chainId);
}

async function listen(chainId: string): Promise<any> {
    try {
        const web3 = getWeb3(chainId, true);
        let lastDate = Date.now()

        const subscription = web3.eth.subscribe("newBlockHeaders");
        subscription
            .on("data", async (blockHeader) => {
                await BlockInitializer(chainId, blockHeader)
                await updateBlock(chainId, blockHeader)
                lastDate = Date.now()
            })
            .on("changed", (data) => [
                console.log(`Data changed`, data)
            ])
            .on("error", (error: Error) => {
                console.error(`Listener error`, error)
            })
            .on("connected", (subscriptionId) => {
                console.log(`Subscribed to ${subscriptionId}`);
            });


        const interval = setInterval(async () => {
            if (lastDate + 5000 < Date.now()) {
                await subscription.unsubscribe();
                console.log(`Unsubscribed from ${subscription.id}`)
                clearInterval(interval);

                historicalSync(chainId).catch(() => null);
                listen(chainId).catch(() => null);
            }
        }, 1000);

    } catch (error) {
        console.error(`Listener error for ${chainId}`, error);
    }

}

async function historicalSync(chainId: string, fromBlock?: number, toBlock?: number) {
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
            const blockHeader = await web3.eth.getBlock(from, true)
            await BlockInitializer(chainId, blockHeader)
        }

        console.log(`Historical blocks were synced| ${fromBlock}-${toBlock}`)
    } catch (error: any) {
        console.error(`Error while syncing historical blocks`, error)
    }
}

export default init;
export {
    historicalSync,
    listen
}
