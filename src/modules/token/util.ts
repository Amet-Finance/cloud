import {TokenResponse} from "./types";
import {getAddress} from "ethers";

function generateTokenResponse(chainId: number, tokenInfo: any): TokenResponse {

    const {name, symbol, decimals, icon, isVerified, contractAddress, unidentified} = tokenInfo
    const contractsLowercase = contractAddress.toLowerCase();
    const _id = `${contractAddress}_${chainId}`.toLowerCase()

    const tokenResponse: TokenResponse = {
        _id,
        contractAddress: contractsLowercase,
        chainId: Number(chainId),
        name,
        symbol,
        decimals
    }

    if (isVerified) {
        tokenResponse.icon = getIcon(icon, isVerified);
        tokenResponse.isVerified = Boolean(isVerified);
    }

    if (unidentified) {
        tokenResponse.unidentified = true;
    }

    return tokenResponse
}


function validateAddress(address: string) {
    return address && getAddress(address)
}

function getIcon(icon: string, isVerified: boolean) {
    if (isVerified) {
        return `https://storage.amet.finance/icons/${icon}`
    }
}

export {
    validateAddress,
    generateTokenResponse,
    getIcon
}
