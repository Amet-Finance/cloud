import {Transaction} from "web3-core";
import {getWeb3} from "../modules/web3/utils";
import {CONTRACT_TYPES} from "./constants";
import {extractBond, extractIssuer} from "./zcb/transaction";
import {getContract} from "./cache";

async function extractTransaction(chainId: number, transaction: Transaction): Promise<void> {
    const toAddress = transaction.to || ""
    const contract = getContract(chainId, toAddress);

    if (!contract) {
        return;
    }

    const web3 = getWeb3(chainId)
    const transactionReceipt = await web3.eth.getTransactionReceipt(transaction.hash);

    switch (contract.type) {
        case CONTRACT_TYPES.ZcbIssuer: {
            await extractIssuer(chainId, transactionReceipt)
        }
        case CONTRACT_TYPES.ZcbBond: {
            await extractBond(chainId, transactionReceipt)
        }
    }
}

export {
    extractTransaction
}
