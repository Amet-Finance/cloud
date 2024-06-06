import { Chains } from 'amet-utils';

const SupportedChains = [Chains.Base, Chains.Arbitrum];
const AMET_WEB_URL = 'https://amet.finance';

const AMT_CONTRACT_ADDRESS = {
    [Chains.Base]: '0x9ea46d9dc50c720c1fe12befd4a6115f87a2a6cd',
};

export { SupportedChains, AMET_WEB_URL, AMT_CONTRACT_ADDRESS };
