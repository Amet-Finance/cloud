import {getTokenInfo} from "./index";
import connection from "../../db/main";
import {getWeb3} from "../../modules/web3/utils";
import ERC20_ABI from './abi-jsons/ERC20.json'
import {toBN} from "web3-utils";
import {TokenBalance} from "./type";
import TokenService from "../../modules/token";

async function getBalance(chainId: number, contractAddress: string, address: string, decimals: number): Promise<TokenBalance> {
    const web3 = getWeb3(chainId);
    const contract = new web3.eth.Contract(ERC20_ABI as any, contractAddress);
    const balance = await contract.methods.balanceOf(address).call();
    const balanceClean = toBN(balance).div(toBN(10).pow(toBN(decimals))).toNumber();
    return {
        balance,
        balanceClean
    };
}

export {
    getBalance
}
