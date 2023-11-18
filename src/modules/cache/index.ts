import TokenService from '../token'

async function InitiateCache(chainIds: number[]) {
    await TokenService.cache(chainIds);

    setInterval(async () => {
        await TokenService.cache(chainIds)
    }, 60000)
}

export default InitiateCache;
