import {getTokenInfo} from "./index";
import connection from "../../db/main";
import {getWeb3} from "../../modules/web3/utils";
import ERC20_ABI from './abi-jsons/ERC20.json'
import {toBN} from "web3-utils";

async function getBalance(chainId: number, contractAddress: string, address: string, decimals: number) {
    const web3 = getWeb3(chainId);
    const contract = new web3.eth.Contract(ERC20_ABI as any, contractAddress);
    const balance = await contract.methods.balanceOf(address).call();
    const balanceClean = toBN(balance).div(toBN(10).pow(toBN(decimals))).toNumber();
    return {
        balance,
        balanceClean
    };
}

async function updateTokens(chainId: number, contractAddresses: string[]) {

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

export {
    getBalance,
    updateTokens
}
