import connection from '../../db/main';
import axios from 'axios';
import { AnyBulkWriteOperation } from 'mongodb';

export default async function calculatePricesFromCoinMarketCap() {
    const tokens = await connection.token.find({ cmId: { $exists: true } }).toArray();

    const cmIds = tokens.map((item) => item.cmId);
    if (!cmIds.length) return;

    const result = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest`, {
        headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_KEY },
        params: { id: cmIds.join(',') },
    });

    const tokenQuotes = result.data.data;
    const bulkWrites: AnyBulkWriteOperation[] = [];

    for (const token of tokens) {
        if (!token.cmId) continue;

        const priceUsd = tokenQuotes[token.cmId].quote['USD'].price;
        bulkWrites.push({
            updateOne: {
                filter: {
                    _id: token._id as any,
                },
                update: {
                    $set: {
                        priceUsd: priceUsd,
                    },
                },
                upsert: true,
            },
        });
    }

    if (bulkWrites.length) await connection.token.bulkWrite(bulkWrites as any);
}
