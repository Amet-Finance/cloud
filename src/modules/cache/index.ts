import TokenService from '../token'

async function InitiateCache(chainIds: number[]) {
    setInterval(async () => {
        await TokenService.cache(chainIds)
    }, 60000)
}

export default InitiateCache;
