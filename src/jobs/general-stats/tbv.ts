import connection from "../../db/main";
import CalculatorController from "../../modules/statistics/calculator";
import GraphqlAPI from "../../modules/api/graphql";
import {SUPPORTED_CHAINS} from "../../constants";

export default async function calculateDailyStats() {

    let tbv = 0;

    for (const chainId of SUPPORTED_CHAINS) {
        const {bonds} = await GraphqlAPI.getDataForTBV(chainId)


        for (const bond of bonds) {
            const currentTbv = await CalculatorController.tbv(chainId, bond);
            if (currentTbv) tbv += currentTbv
        }


        await connection.general.updateOne({
            _id: "tbv-daily-stats" as any,
        }, {
            $push: {
                values: [Date.now(), Math.round(tbv)]
            }
        }, {
            upsert: true
        })
    }

}
