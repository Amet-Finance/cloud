import {toChecksumAddress} from "web3-utils";
import Web3 from "web3";
import {TokenResponse} from "../../../modules/web3/type";

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
    return address && toChecksumAddress(address)
}

function validateSignature(address: string, signature: string, message: string) {
    if (!address || !signature || !message) {
        throw Error("Parameter is missing");
    }

    const web3 = new Web3();
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
        throw Error("Invalid signer")
    }
}

function getIcon(icon: string, isVerified: string) {
    if (isVerified) {
        return `https://storage.amet.finance/icons/${icon}`
    }
}

export {
    validateAddress,
    validateSignature,
    generateTokenResponse,
    getIcon
}
