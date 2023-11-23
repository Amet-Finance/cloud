import {RPCsByChain} from "./constants";
import {ethers} from "ethers";

function getProvider(chainId: number, isFallback?: boolean) {
    const rpc = getRPC(chainId, isFallback)
    return ethers.getDefaultProvider(rpc);
}

function getRPC(chainId: number, isFallback?: boolean): string {
    const rpcs = RPCsByChain[chainId]
    let rpcArray: string[];

    if (isFallback && rpcs?.fallback.length) {
        rpcArray = rpcs.fallback
    } else {
        rpcArray = rpcs.def
    }

    const randomInt = Math.floor(Math.random() * rpcArray.length)
    return rpcArray[randomInt];
}

export {
    getProvider
}
