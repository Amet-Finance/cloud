const CHAINS = {
    Ethereum: "0x1",
    Mumbai: "0x13881"
}

const RPCsByChain = {
    [CHAINS.Mumbai]: {
        def: ['https://polygon-mumbai-bor.publicnode.com'],
        ws: ["wss://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"],
        fallback: ["https://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"]
    }
}


export  {
    CHAINS,
    RPCsByChain
}