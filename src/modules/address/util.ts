import { verifyMessage } from 'ethers';

function validateSignature(address: string, signature: string, message: string) {
    // todo here can be vulnerability, as if the signature should check for the exact message
    if (!address || !signature || !message) {
        throw Error('Parameter is missing');
    }

    const recoveredAddress = verifyMessage(message, signature);
    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
        throw Error('Invalid signer');
    }
}

export { validateSignature };
