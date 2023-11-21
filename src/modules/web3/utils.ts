import Web3 from "web3";
import {RPCsByChain} from "./constants";

function getWeb3(chainId: number, isFallback?: boolean) {

    const rpc = getRPC(chainId, isFallback)
    return new Web3(rpc);
}

function getRPC(chainId: number, isFallback?: boolean): string {
    const rpcs = RPCsByChain[chainId]
    let rpcArray = [];

    if (isFallback && rpcs?.fallback.length) {
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
