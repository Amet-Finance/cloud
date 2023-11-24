import {RpcByChain} from "./type";


const CONTRACT_TYPES = {
    ZcbIssuer: "zcb-issuer",
    ZcbBond: "zcb-bond"
}
const CHAINS = {
    MantaPacific: 169,
    Polygon: 137,
    PolygonZKEVM: 1101,
    Bsc: 56,

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
    [CHAINS.Bsc]: {
        def: [
            "https://binance.llamarpc.com",
            "https://bsc-dataseed1.defibit.io",
            "https://bsc-dataseed2.defibit.io",
            "https://bsc-pokt.nodies.app",
            "https://bsc.meowrpc.com",
            "https://bsc.publicnode.com",
            "https://rpc.ankr.com/bsc"
        ],
        fallback: []
    },
    [CHAINS.Zeta]: {
        def: [
            "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
            "https://rpc.ankr.com/zetachain_evm_athens_testnet"
        ],
        fallback: []
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
        fallback: [
            'https://polygon-mumbai.g.alchemy.com/v2/vdCSMJlB9ng8e6v7FwDel0vlyjAtD7bo'
        ]
    },
}


export {
    CHAINS,
    RPCsByChain,
    CONTRACT_TYPES
}
