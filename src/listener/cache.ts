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
        // todo make this better with re-caching(deleting previous objects in memory)
        const contractsTmp = await connection.db.collection(`Contract_${chainId}`).find().toArray();
        contracts[chainId] = {};

        for (const contract of contractsTmp) {
            const contractAddress = contract._id.toString().toLowerCase()
            contracts[chainId][contractAddress] = {
                _id: contractAddress,
                type: contract.type
            }
        }
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
