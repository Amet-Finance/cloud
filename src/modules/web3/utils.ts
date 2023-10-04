import Web3 from "web3";
import {RPCsByChain} from "./constants";

function getWeb3(chainId: string, isWS?: boolean, isFallback?: boolean) {

    const rpc = getRPC(chainId, isWS, isFallback)
    return new Web3(rpc);
}

function getRPC(chainId: string, isWS?: boolean, isFallback?: boolean): string {
    const rpcs = RPCsByChain[chainId]
    let rpcArray = [];


    if (isWS) {
        rpcArray = rpcs.ws
    } else if (isFallback) {
        rpcArray = rpcs.fallback
    } else {
        rpcArray = rpcs.def
    }

    const randomInt = Math.floor(Math.random() * rpcArray.length)
    return rpcArray[randomInt];
}

export {
    getWeb3
}