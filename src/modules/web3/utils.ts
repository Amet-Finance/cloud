import Web3 from "web3";

function getWeb3(isWS?: boolean, isFallback?: boolean) {
    let rpc;
    if (isWS) {
        rpc = "wss://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"
    } else {
        rpc = "https://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"
    }

    return new Web3(rpc)
}

export  {
    getWeb3
}