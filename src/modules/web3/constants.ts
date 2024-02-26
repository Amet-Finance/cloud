import {RpcByChain} from "./type";


const CONTRACT_TYPES = {
    FIXED_FLEX: {
        ISSUER: "fixed-flex-issuer",
        BOND: "fixed-flex-bon"
    }
}
const CHAINS = {
    MantaPacific: 169,
    Polygon: 137,
    PolygonZKEVM: 1101,
    Bsc: 56,
    Optimism: 10,

    Zeta: 7001,
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
        fallback: [
            "https://rpc.ankr.com/polygon/74cb08b0ad4e0fc6ef41f8486f6a2b309f11519cf33e8986810642447393cdc2"
        ]
    },
    [CHAINS.PolygonZKEVM]: {
        def: [
            "https://zkevm-rpc.com",
            "https://polygon-zkevm.drpc.org",
            "https://rpc.polygon-zkevm.gateway.fm",
            "https://polygon-zkevm.drpc.org",
            "https://zkevm-rpc.com",
            "https://polygon-zkevm.blockpi.network/v1/rpc/public",
            // "https://rpc.ankr.com/polygon_zkevm",
            // "https://polygon-zkevm-mainnet.public.blastapi.io"
        ],
        fallback: [
            "https://rpc.ankr.com/polygon_zkevm/74cb08b0ad4e0fc6ef41f8486f6a2b309f11519cf33e8986810642447393cdc2"
        ]
    },
    [CHAINS.MantaPacific]: {
        def: [
            "https://pacific-rpc.manta.network/http",
            "https://1rpc.io/manta"
        ],
        fallback: []
    },
    [CHAINS.Bsc]: {
        def: [
            "https://binance.llamarpc.com",
            "https://bsc-dataseed1.defibit.io",
            // "https://bsc-dataseed2.defibit.io",
            // "https://bsc-pokt.nodies.app",
            // "https://bsc.meowrpc.com",
            "https://bsc.publicnode.com",
            "https://rpc.ankr.com/bsc"
        ],
        fallback: [
            "https://rpc.ankr.com/bsc/74cb08b0ad4e0fc6ef41f8486f6a2b309f11519cf33e8986810642447393cdc2"
        ]
    },
    [CHAINS.Zeta]: {
        def: [
            // "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
            "https://rpc.ankr.com/zetachain_evm_athens_testnet"
        ],
        fallback: [
            "https://rpc.ankr.com/zetachain_evm_athens_testnet/74cb08b0ad4e0fc6ef41f8486f6a2b309f11519cf33e8986810642447393cdc2"
        ]
    },
    [CHAINS.Optimism]: {
        def: [
            "https://optimism.llamarpc.com",
            "https://rpc.ankr.com/optimism",
            "https://mainnet.optimism.io",
            "https://op-pokt.nodies.app",
            "https://optimism.publicnode.com"
        ],
        fallback: [
            "https://rpc.ankr.com/optimism/74cb08b0ad4e0fc6ef41f8486f6a2b309f11519cf33e8986810642447393cdc2"
        ]
    },

    // TESTNET
    [CHAINS.Mumbai]: {
        def: [
            "https://rpc.ankr.com/polygon_mumbai",
            'https://polygon-mumbai-bor.publicnode.com',
            'https://polygon-testnet.public.blastapi.io',
            'https://polygon-mumbai-pokt.nodies.app',
            'https://polygon-mumbai.blockpi.network/v1/rpc/public'
        ],
        fallback: []
    },
}


function chainExists(chainId: any) {
    return Object.values(CHAINS).includes(Number(chainId))
}

export {
    CHAINS,
    RPCsByChain,
    CONTRACT_TYPES,
    chainExists
}
