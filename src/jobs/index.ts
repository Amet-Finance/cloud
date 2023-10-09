import {scheduleJob} from "node-schedule"
import UpdateGeneralStats from "./general-stats";

const jobs = [
    {
        name: "General Stats update",
        scheduler: "0 * * * *", // every hour
        instance: UpdateGeneralStats
    }
]

function init() {

    for (const job of jobs) {
        scheduleJob(job.scheduler, () => {
            job.instance()
                .then(() => {
                    console.log(`Job ${job.name} successfully finished`);
                })
                .catch((error: any) => {
                    console.error(`Job ${job.name} failed: ${error.message}`);
                })
        })
    }

}

export default init;