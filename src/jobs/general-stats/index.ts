import connection from "../../db/main";
import {CONTRACT_TYPES} from "../../listener/constants";
import {CHAINS} from "../../modules/web3/constants";

// todo update this logic as well, maybe take from the Token collection with isStable or price updating regularly
const Stables: { [key: string]: { [key: string]: { symbol: string, decimals: number } } } = {
    [CHAINS.Mumbai]: {
        "0x4714816Fa7cf2B52c789D243BEab4d58ca79e35B": {
            symbol: "USDT",
            decimals: 18
        },
        "0x06e1B6Ea003439210DBfF0555cBa86803a01913c": {
            symbol: "USDT",
            decimals: 18
        }
    }
}

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

                for (const contract of chainStats) {
                    if (contract.type !== CONTRACT_TYPES.ZcbIssuer) {
                        generalStats.issued += 1
                        generalStats.purchased += Number(contract.purchased)
                        generalStats.redeemed += Number(contract.redeemed)

                        const investmentTokenInfo = Stables?.[chainId]?.[contract.investmentToken]
                        if (investmentTokenInfo && contract.purchased) {
                            generalStats.volumeUSD += contract.purchased * (contract.investmentTokenAmount / 10 ** investmentTokenInfo.decimals)
                        }

                        const interestTokenInfo = Stables?.[chainId]?.[contract.interestToken]
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
    } catch (error) {
        console.error(`Updating general stats error`, error)
    }
}

export default updateGeneralStats;
