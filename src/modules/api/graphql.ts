import {CHAINS} from "amet-utils";
import {StringKeyedObject} from "../../types";
import {postAPI} from "./index";
import {BondGeneralStatsShort, UserGeneralStatsShort} from "./type";


function getApi(chainId: number) {
    const API: StringKeyedObject<string> = {
        [CHAINS.Base]: `https://gateway-arbitrum.network.thegraph.com/api/bfadad3998f2e41d8fc090f895bf3aa7/subgraphs/id/JBBiYxUHriMu5GpUtiuPLzroZbD6aGkaoipdLRn47BMy`
    }

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


const GraphqlAPI = {
    getDataForGeneralStatistics,
    getDataForTBV
}

export default GraphqlAPI;
