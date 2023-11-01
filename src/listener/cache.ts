import connection from '../db/main'
import {Contract} from "./types";

const contracts: {
    [chainId: number]: {
        [contractAddress: string]: Contract
    }
} = {}

async function cache(chainId: number) {
    let timeout = 5000;
    try {
        const contractsTmp = await connection.db.collection(`Contract_${chainId}`).find().toArray();
        const contractsTmpCache: any = {}

        for (const contract of contractsTmp) {
            const contractAddress = contract._id.toString().toLowerCase()
            contractsTmpCache[contractAddress] = {
                _id: contractAddress,
                type: contract.type
            }
        }

        contracts[chainId] = contractsTmpCache;
    } catch (error) {
        timeout = 1000;
        console.error(`Cache contract`, error)
    }

    setTimeout(() => cache(chainId), timeout)
}

function getContract(chainId: number, contractAddress: string): Contract | undefined {
    const lowercase = contractAddress.toLowerCase()
    return contracts[chainId][lowercase];
}

export {
    cache,
    getContract
}
