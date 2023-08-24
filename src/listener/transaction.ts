import {Transaction} from "web3-core";
import {getWeb3} from "../modules/web3/utils";
import {CONTRACT_TYPES} from "./constants";
import {extractBond, extractIssuer} from "./zcb/transaction";
import {getContract} from "./cache";
import {Contract} from "./types";

async function extractTransaction(transaction: Transaction): Promise<void> {
    const toAddress = transaction.to || ""
    const contract = getContract(toAddress);

    if (!contract) {
        return;
    }

    const web3 = getWeb3()
    const transactionReceipt = await web3.eth.getTransactionReceipt(transaction.hash);

    switch (contract.type) {
        case CONTRACT_TYPES.ZcbIssuer: {
            await extractIssuer(transactionReceipt)
        }
        case CONTRACT_TYPES.ZcbBond: {
            await extractBond(transactionReceipt)
        }
    }
}

export {
    extractTransaction
}