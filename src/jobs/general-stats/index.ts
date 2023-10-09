import connection from "../../db/main";
import {CONTRACT_TYPES} from "../../listener/constants";

async function updateGeneralStats() {

    try {
        const generalStats = {
            issued: 0,
            volumeUSD: 420250,
            purchased: 0,
            redeemed: 0
        }
        const collections = await connection.db.collections()

        for (const collection of collections) {
            if (collection.collectionName.startsWith("Contract_")) {
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

                        // todo add volume as well here
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