import {scheduleJob} from "node-schedule"
import UpdateGeneralStats from "./general-stats";
import calculatePricesFromCoinMarketCap from "./token/prices-cm";
import calculateDailyStats from "./general-stats/tbv";

const jobs = [
    {
        name: "Update General Stats",
        scheduler: "0 * * * *", // every hour
        instance: UpdateGeneralStats
    },
    {
        name: "Calculate Token Prices",
        scheduler: "0 * * * *", // every hour
        instance: calculatePricesFromCoinMarketCap
    },
    {
        name: "Calculate TBV",
        scheduler: "0 1 * * *", // every day at 1am
        instance: calculateDailyStats
    }
]

function init() {

    for (const job of jobs) {
        scheduleJob(job.scheduler, async () => {
            console.log(`[${job.name}] Starting...`)
            job.instance()
                .then(() => {
                    console.log(`[${job.name}] Finished...`);
                })
                .catch((error: any) => {
                    console.error(`[${job.name}] Failed| ${error.message}`);
                })
        })
    }

}

export default init;
