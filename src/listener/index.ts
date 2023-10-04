import {getWeb3} from "../modules/web3/utils";
import BlockInitializer from "./block";
import * as CacheService from "./cache";

async function init(chainId: string) {
    await CacheService.cache(chainId)
    return listen(chainId);
}
// todo continue from here
function listen(chainId: string) {
    const web3 = getWeb3(chainId, true);

    const subscription = web3.eth.subscribe("newBlockHeaders");

    subscription.on("data", (blockHeader) => BlockInitializer(chainId, blockHeader));
    subscription.on("changed", (data) => [
        console.log(`Data changed`, data)
    ]);
    subscription.on("error", (error: Error) => {
        console.error(`Listener error`, error)
        // subscription.unsubscribe(function (error, success) {
        //     if (success) {
        //         console.log('Successfully unsubscribed!');
        //         return listen();
        //     }
        // });
    });
    subscription.on("connected", (subscriptionId) => {
        console.log(`Connected to ${subscriptionId}`);
    });

}

export default init;