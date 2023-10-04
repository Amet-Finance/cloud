import {getTokenInfo} from "./index";
import connection from "../../db/main";

async function updateTokens(chainId: string, contractAddresses: string[]) {

    const contractsLoweCased = contractAddresses.map(item => item.toLowerCase())

    const dbHistory = await connection.db.collection(`Token_${chainId}`).distinct("_id", {
        _id: {
            $in: contractsLoweCased as any
        }
    })

    const filteredContracts = contractsLoweCased.filter((address: any) => {
        if (!dbHistory.includes(address)) {
            return true
        }
    })

    const insertObject: { [key: string]: any } = {};
    for (const contractAddress of filteredContracts) {

        if (!insertObject[contractAddress]) {
            const token = await getTokenInfo(chainId, contractAddress);
            if (token) {
                insertObject[token._id] = token
            }
        }
        
    }

    if (Object.values(insertObject).length) {
        await connection.db.collection(`Token_${chainId}`).insertMany(Object.values(insertObject));
    }
}

export {updateTokens}