import connection from "../../db/main";
import {CONTRACT_TYPES} from "../../listener/constants";
import {CHAINS} from "../../modules/web3/constants";
import TokenService from "../../modules/token";

async function updateGeneralStats() {

    try {
        const generalStats = {
            issued: 0,
            volumeUSD: 0,
            purchased: 0,
            redeemed: 0
        }
        const collections = await connection.db.collections()

        for (const collection of collections) {
            if (collection.collectionName.startsWith("Contract_")) {
                const isTestnet = collection.collectionName.includes(CHAINS.Mumbai.toString())
                if (isTestnet) {
                    continue;
                }

                const chainId = collection.collectionName.replace("Contract_", "")
                const chainStats = await collection.find().project({
                    purchased: 1,
                    redeemed: 1,
                    type: 1,
                    investmentToken: 1,
                    investmentTokenAmount: 1,
                    interestToken: 1,
                    interestTokenAmount: 1
                }).toArray()


                const tokensArray = TokenService.getStableTokens(Number(chainId));

                const stables = tokensArray.reduce((acc, item) => {
                    acc[item._id.toString().toLowerCase()] = {
                        decimals: item.decimals
                    }
                    return acc;
                }, {} as any)


                for (const contract of chainStats) {
                    if (contract.type !== CONTRACT_TYPES.ZcbIssuer) {
                        generalStats.issued += 1
                        generalStats.purchased += Number(contract.purchased)
                        generalStats.redeemed += Number(contract.redeemed)

                        const investmentTokenInfo = stables?.[contract.investmentToken.toLowerCase()]
                        if (investmentTokenInfo && contract.purchased) {
                            generalStats.volumeUSD += contract.purchased * (contract.investmentTokenAmount / 10 ** investmentTokenInfo.decimals)
                        }

                        const interestTokenInfo = stables?.[contract.interestToken.toLowerCase()]
                        if (interestTokenInfo && contract.redeemed) {
                            generalStats.volumeUSD += contract.redeemed * (contract.interestTokenAmount / 10 ** interestTokenInfo.decimals)
                        }
                    }
                }
            }
        }

        await connection.db.collection("General").updateOne({
            _id: "general-stats" as any
        }, {
            $set: generalStats
        }, {upsert: true})
    } catch (error: any) {
        console.error(`Updating general stats error`, error.message)
    }
}

export default updateGeneralStats;
