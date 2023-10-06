import {getWeb3} from "../modules/web3/utils";
import BlockInitializer from "./block";
import * as CacheService from "./cache";

async function init(chainId: string) {
    await CacheService.cache(chainId)
    return listen(chainId);
}

async function listen(chainId: string): Promise<any> {
    try {
        const web3 = getWeb3(chainId, true);
        const config = {
            lastDate: Date.now(),
            fromBlock: 0
        }
        const subscription = web3.eth.subscribe("newBlockHeaders");

        subscription.on("data", (blockHeader) => {
            BlockInitializer(chainId, blockHeader).catch(error => null);
            config.lastDate = Date.now()
        });
        subscription.on("changed", (data) => [
            console.log(`Data changed`, data)
        ]);
        subscription.on("error", (error: Error) => {
            console.error(`Listener error`, error)
        });
        subscription.on("connected", (subscriptionId) => {
            console.log(`Connected to ${subscriptionId}`);
        });


        const interval = setInterval(async () => {
            if (config.lastDate + 5000 < Date.now()) {
                await subscription.unsubscribe();
                clearInterval(interval);

                listen(chainId).catch(() => null);
                historicalSync(chainId, config.fromBlock).catch(() => null);
            }
        }, 1000);

    } catch (error) {
        console.error(`Listener error for ${chainId}`, error);
    }

}

async function historicalSync(chainId: string, fromBlock: number, toBlock?: number) {
    try {
        const web3 = getWeb3(chainId);

        if (!toBlock) {
            toBlock = await web3.eth.getBlockNumber()
        }

        for (let from = fromBlock; from <= toBlock; from++) {
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