import { StringKeyedObject } from '../../../types';
import axios from 'axios';

const scoresCache: StringKeyedObject<{ lastUpdated: number; score: number }> = {};
const cacheTime = 60 * 60 * 1000;
const scorerId = '7430';
const scorerApiKey = process.env.GITCOIN_SCORE_API_KEY;

async function update(address: string): Promise<number> {
    try {
        const { data } = await axios.get(`https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`, { headers: { 'X-API-KEY': scorerApiKey } });

        const score = data.score;
        scoresCache[address.toLowerCase()] = {
            lastUpdated: Date.now(),
            score,
        };

        return score;
    } catch (error) {
        console.error(`GitcoinScoreControllerV1.update`, error);
        return 0;
    }
}

async function get(address: string): Promise<number> {
    const cachedValue = scoresCache[address.toLowerCase()];
    if (cachedValue && Date.now() - cachedValue.lastUpdated < cacheTime) return cachedValue.score;

    return await update(address);
}

const GitcoinScoreControllerV1 = {
    get,
};

export default GitcoinScoreControllerV1;
