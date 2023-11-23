import {verifyMessage} from "ethers";

function validateSignature(address: string, signature: string, message: string) {
    if (!address || !signature || !message) {
        throw Error("Parameter is missing");
    }

    const recoveredAddress = verifyMessage(message, signature);
    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
        throw Error("Invalid signer")
    }
}

export {
    validateSignature
}
