import {getTokenInfo} from "./index";
import connection from "../../db/main";
import {DEFAULT_CHAIN} from "../constants";

async function updateTokens(contractAddresses: string[]) {

    const contractsLoweCased = contractAddresses.map(item => item.toLowerCase())

    const dbHistory = await connection.db.collection(`Token_${DEFAULT_CHAIN}`).distinct("_id", {
        _id: {
            $in: contractsLoweCased as any
        }
    })

    const filteredContracts = contractsLoweCased.filter((address: any) => {
        if (!dbHistory.includes(address)) {
            return true
        }
    })

    const insertArray = [];
    for (const contractAddress of filteredContracts) {
        const token = await getTokenInfo(contractAddress);
        if (token) {
            insertArray.push(token);
        }
    }

    if (insertArray.length) {
        await connection.db.collection(`Token_${DEFAULT_CHAIN}`).insertMany(insertArray as any);
    }
}

export {updateTokens}