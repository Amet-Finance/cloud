import TokenService from '../token'

async function InitiateCache() {
    await TokenService.cache();

    setInterval(TokenService.cache, 60000)
}

export default InitiateCache;
