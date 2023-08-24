import {getWeb3} from "../modules/web3/utils";
import BlockInitializer from "./block";
import * as CacheService from "./cache";

async function init() {

    await CacheService.cache()
    return listen();
}

function listen() {
    const web3 = getWeb3(true);

    const subscription = web3.eth.subscribe("newBlockHeaders");

    subscription.on("data", BlockInitializer);
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