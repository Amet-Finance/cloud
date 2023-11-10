const CHAINS = {
    Ethereum: 1,
    Mumbai: 80001,
    Polygon: 137,
    Bsc: 56
}

const RPCsByChain: {
    [key: number]: {
        def: string[],
        fallback: string[]
    }
} = {
    [CHAINS.Mumbai]: {
        def: [
            "https://rpc.ankr.com/polygon_mumbai",
            'https://polygon-mumbai-bor.publicnode.com',
            'https://polygon-testnet.public.blastapi.io',
            'https://polygon-mumbai-pokt.nodies.app',
            'https://polygon-mumbai.blockpi.network/v1/rpc/public'
        ],
        fallback: [
            'https://polygon-mumbai.g.alchemy.com/v2/vdCSMJlB9ng8e6v7FwDel0vlyjAtD7bo'
        ]
    },
    [CHAINS.Ethereum]: {
        def: [
            "https://rpc.ankr.com/eth",
        ],
        fallback: [
            // "https://polygon-mumbai.g.alchemy.com/v2/HtUSvOmpwz-7yU8XArdaY1hNulHm-4Qf", // amet-cloud-mumbai-2
            // "https://polygon-mumbai.g.alchemy.com/v2/4EO5W8BnqaQOOGdbzVknVAWxLREsUM1o", // amet-cloud-mumbai-1
            // "https://polygon-mumbai.g.alchemy.com/v2/HxgK8Fm1XwXogQgqfViohtUmEOFwEor-"
        ]
    }
}


export {
    CHAINS,
    RPCsByChain
}
