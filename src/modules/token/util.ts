import {TokenResponse} from "../web3/type";
import {getAddress} from "ethers";

function generateTokenResponse(chainId: number, tokenInfo: any): TokenResponse {

    const {_id, name, symbol, decimals, icon, isVerified} = tokenInfo
    return {
        _id: _id.toLowerCase(),
        name,
        symbol,
        icon: getIcon(icon, isVerified),
        decimals,
        isVerified: Boolean(isVerified)
    }
}


function validateAddress(address: string) {
    return address && getAddress(address)
}


function getIcon(icon: string, isVerified: string) {
    if (isVerified) {
        return `https://storage.amet.finance/icons/${icon}`
    }
}

export {
    validateAddress,
    generateTokenResponse,
    getIcon
}
