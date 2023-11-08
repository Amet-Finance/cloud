import {toChecksumAddress} from "web3-utils";
import Web3 from "web3";

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

export {
    validateAddress,
    validateSignature
}
