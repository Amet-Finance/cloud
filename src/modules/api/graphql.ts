import { CHAINS } from 'amet-utils';
import { StringKeyedObject } from '../../types';
import { postAPI } from './index';
import {
    ActionLogForXP,
    BondGeneralStatsShort,
    BondIssuerDetail,
    UserGeneralStatsShort,
} from './type';

function getApi(chainId: number) {
    const API: StringKeyedObject<string> = {
        [CHAINS.Base]: `https://subgraph.satsuma-prod.com/10c8c7e96744/unconstraineds-team--970943/Amet-Finance-8453/version/0.5.2/api`,
    };

    return API[chainId];
}

async function getDataForGeneralStatistics(chainId: number) {

    const query = `
    {
  bonds {
    id
    purchased
    redeemed
    purchaseAmount
    payoutAmount
    payoutToken {
      id
    }
    purchaseToken {
      id
    }
  }
  users {
    id
  }
}`

    const url = getApi(chainId)
    const response = await postAPI({url, body: {query}})

    return {
        bonds: response.data.bonds as BondGeneralStatsShort[],
        users: response.data.users as UserGeneralStatsShort[]
    }
}

async function getDataForTBV(chainId: number) {

    const query = `
    {
      bonds {
        id
        purchased
        redeemed
        purchaseAmount
        payoutAmount
        payoutToken {
          id
        }
        purchaseToken {
          id
        }
      }
    }`

    const url = getApi(chainId)
    const response = await postAPI({url, body: {query}})

    return {bonds: response.data.bonds as BondGeneralStatsShort[]}
}

async function getDataForXP(chainId: number) {
    const query = `{
            actionLogs {
            id
            from
            to
            count
            bond {
                purchaseAmount
                payoutAmount
              }
            }
            bonds {
                issuer {
                      id
                }
        }
    }`;

    const url = getApi(chainId);
    const response = await postAPI({ url, body: { query } });

    return {
        bonds: response.data.bonds as BondIssuerDetail[],
        actionLogs: response.data.actionLogs as ActionLogForXP[],
    };
}

const GraphqlAPI = {
    getDataForGeneralStatistics,
    getDataForTBV,
    getDataForXP
}

export default GraphqlAPI;
