import { Chains } from 'amet-utils';

const FIXED_FLEX_ISSUER_CONTRACTS: { [chainId: number | string]: string[] } = {
    [Chains.Base]: ['0xE67BE43603260b0AD38bBfe89FcC6fDe6741e82A'],
    [Chains.Arbitrum]: ['0x65A8d1EcC30351328BDf86612Ae31e46172c4DA9'],
    [Chains.JoltEvmDev]: ['0x875B73364432d14EEb99eb0eAC6bAaCbEe6829E2'],
};

const GRAPH_CONFIG: { [chainId: number]: { startBlock: number; url: string } } = {
    [Chains.Base]: {
        startBlock: 14022551,
        url: 'https://subgraph.satsuma-prod.com/10c8c7e96744/unconstraineds-team--970943/Amet-Finance-8453/api',
    },
    [Chains.Arbitrum]: {
        startBlock: 218790445,
        url: 'https://gateway-arbitrum.network.thegraph.com/api/07d0ecc03fc3f9aeffea03e59ee0f10f/subgraphs/id/4cT2qznsGi3npkRR6y2WuUPoEGMwcpUDewdCCJ6wHrvh',
    },
};

export { FIXED_FLEX_ISSUER_CONTRACTS, GRAPH_CONFIG };
