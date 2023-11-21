import {RpcByChain} from "./type";

const CHAINS = {
    MantaPacific: 169,
    Polygon: 137,
    PolygonZKEVM: 1101,


    Bsc: 56,
    Ethereum: 1,

    Mumbai: 80001,
}

const RPCsByChain: RpcByChain = {
    [CHAINS.Polygon]: {
        def: [
            "https://polygon.llamarpc.com",
            "https://polygon-rpc.com",
            "https://rpc.ankr.com/polygon"
        ],
        fallback: []
    },

    [CHAINS.PolygonZKEVM]: {
        def: [
            "https://zkevm-rpc.com",
            "https://polygon-zkevm.drpc.org",
            "https://rpc.polygon-zkevm.gateway.fm",
            "https://polygon-zkevm.drpc.org",
            "https://zkevm-rpc.com",
            "https://polygon-zkevm.blockpi.network/v1/rpc/public",
            "https://rpc.ankr.com/polygon_zkevm",
            "https://polygon-zkevm-mainnet.public.blastapi.io"
        ],
        fallback: []
    },


    [CHAINS.MantaPacific]: {
        def: [
            "https://pacific-rpc.manta.network/http",
            "https://1rpc.io/manta"
        ],
        fallback: []
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
    },


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
}


export {
    CHAINS,
    RPCsByChain
}
