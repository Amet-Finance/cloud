import connection from '../db/main'
import {DEFAULT_CHAIN} from "./constants";
import {Contract} from "./types";

// LowerCased
const contracts: { [key: string]: any } = {}

async function cache() {
    let timeout = 5000;
    try {
        const contractsTmp = await connection.db.collection(`Contract_${DEFAULT_CHAIN}`).find().toArray();

        for (const contract of contractsTmp) {
            const id = contract._id.toString()
            contracts[id] = {
                type: contract.type
            }
        }
    } catch (error) {
        timeout = 1000;
        console.error(`Cache contract`, error)
    }

    setTimeout(cache, timeout)
}

function getContract(contractAddress: string): Contract|undefined {
    const lowercase = contractAddress.toLowerCase()
    return contracts[lowercase];
}

export {
    cache,
    getContract
}