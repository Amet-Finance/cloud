const CHAINS = {
    Ethereum: "0x1",
    Mumbai: "0x13881"
}

const RPCsByChain = {
    [CHAINS.Mumbai]: {
        def: [
            "https://rpc.ankr.com/polygon_mumbai",
            'https://polygon-mumbai-bor.publicnode.com',
            'https://polygon-testnet.public.blastapi.io'
        ],
        ws: [
            "wss://polygon-mumbai.g.alchemy.com/v2/HtUSvOmpwz-7yU8XArdaY1hNulHm-4Qf", // amet-cloud-mumbai-2
            "wss://polygon-mumbai.g.alchemy.com/v2/4EO5W8BnqaQOOGdbzVknVAWxLREsUM1o", // amet-cloud-mumbai-1
            "wss://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"
        ],
        fallback: [
            "https://polygon-mumbai.g.alchemy.com/v2/HtUSvOmpwz-7yU8XArdaY1hNulHm-4Qf", // amet-cloud-mumbai-2
            "https://polygon-mumbai.g.alchemy.com/v2/4EO5W8BnqaQOOGdbzVknVAWxLREsUM1o", // amet-cloud-mumbai-1
            "https://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"
        ]
    }
}


export {
    CHAINS,
    RPCsByChain
}