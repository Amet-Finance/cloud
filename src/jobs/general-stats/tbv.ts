import connection from '../../db/main';
import CalculatorController from '../../modules/statistics/calculator';
import GraphqlAPI from '../../modules/api/graphql';
import { SUPPORTED_CHAINS } from '../../constants';

export default async function calculateDailyStats() {
    let tbv = 0;
    let tvl = 0;

    for (const chainId of SUPPORTED_CHAINS) {
        const { bonds } = await GraphqlAPI.getDataForTBV(chainId);

        for (const bond of bonds) {
            const currentTbv = await CalculatorController.tbv(chainId, bond);
            const currentTvl = await CalculatorController.tvl(chainId, bond);
            if (currentTbv) tbv += currentTbv;
            if (currentTvl) tvl += currentTvl;
        }

        await connection.general.updateOne(
            {
                _id: 'tvl-daily-stats' as any,
            },
            {
                $push: {
                    values: [Date.now(), Math.round(tvl)],
                },
            },
            {
                upsert: true,
            },
        );

        await connection.general.updateOne(
            {
                _id: 'tbv-daily-stats' as any,
            },
            {
                $push: {
                    values: [Date.now(), Math.round(tbv)],
                },
            },
            {
                upsert: true,
            },
        );
    }
}
