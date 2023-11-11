import {toChecksumAddress} from "web3-utils";
import Web3 from "web3";
import {TokenResponse} from "../../../modules/web3/type";

function generateTokenResponse(chainId: number, tokenInfo: any): TokenResponse {

    const {_id, name, symbol, decimals, icon, isVerified} = tokenInfo
    return {
        _id: _id.toLowerCase(),
        name,
        symbol,
        icon: icon || Boolean(isVerified) && getIcon(chainId, _id) || "",
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

function getIcon(chainId: number, contractAddress: string) {
    const lastCommit = "c125b8b9f5c108c475714c7c476ce8481a77f8e4"
    return `https://raw.githubusercontent.com/Amet-Finance/public-meta/${lastCommit}/${chainId}/${contractAddress.toLowerCase()}/logo.svg`
}

export {
    validateAddress,
    validateSignature,
    generateTokenResponse,
    getIcon
}
