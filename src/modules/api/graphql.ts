import { postAPI } from './index';
import { ActionLogForXP, BondGeneralStatsShort, BondIssuerDetail, BondSettledDetails, UserGeneralStatsShort } from './type';
import { GRAPH_CONFIG } from './constants';

async function getDataForGeneralStatistics(chainId: number) {
    const { url, startBlock } = GRAPH_CONFIG[chainId];
    const query = `
    {
          bonds(
          where: {issuanceBlock_gt: "${startBlock}"}
          ) {
            id
            purchased
            redeemed
            purchaseAmount
            payoutAmount
            payoutBalance
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
        }`;

    const response = await postAPI({ url, body: { query } });

    return {
        bonds: response.data.bonds as BondGeneralStatsShort[],
        users: response.data.users as UserGeneralStatsShort[],
    };
}

async function getDataForTBV(chainId: number) {
    const { url, startBlock } = GRAPH_CONFIG[chainId];

    const query = `
    {
      bonds(
      where: {issuanceBlock_gt: "${startBlock}"}
      ) {
        id
        purchased
        redeemed
        purchaseAmount
        payoutAmount
        payoutBalance
        payoutToken {
          id
        }
        purchaseToken {
          id
        }
      }
    }`;

    const response = await postAPI({ url, body: { query } });

    return { bonds: response.data.bonds as BondGeneralStatsShort[] };
}

async function getDataForXP(chainId: number) {
    const { url, startBlock } = GRAPH_CONFIG[chainId];
    const query = `{
           actionLogs {
                count
                from
                to
                bond {
                  payoutToken {
                    id
                  }
                  purchaseToken {
                    id
                  }
                  purchaseAmount
                  payoutAmount
                }
              }
            bonds(
            where: {issuanceBlock_gt: "${startBlock}"}
            ) {
                issuer {
                      id
                }
                isSettled
        }
    }`;

    const response = await postAPI({ url, body: { query } });

    return {
        bonds: response.data.bonds as (BondIssuerDetail & BondSettledDetails)[],
        actionLogs: response.data.actionLogs as ActionLogForXP[],
    };
}

const GraphqlAPI = {
    getDataForGeneralStatistics,
    getDataForTBV,
    getDataForXP,
};

export default GraphqlAPI;
