import {getProvider} from "./utils";
import ERC20_ABI from "../web3/abi-jsons/ERC20.json";
import {TokenBalance, TokenInfoFromBlockchain} from "./type";
import BigNumber from "bignumber.js";
import {ethers} from "ethers";


async function getTokenInfo(chainId: number|string, contractAddress: string, isFallback?: boolean): Promise<TokenInfoFromBlockchain> {
    try {
        const provider = getProvider(chainId, isFallback);
        const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider)

        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();

        return {
            contractAddress: contractAddress.toLowerCase(),
            name,
            symbol,
            chainId: Number(chainId),
            decimals: Number(decimals)
        };
    } catch (error: any) {
        console.error(`getTokenInfo`, error.message)
        if (isFallback) {
            throw Error(error)
        }
        return getTokenInfo(chainId, contractAddress, true)
    }
}

async function getBalance(chainId: number|string, contractAddress: string, address: string, decimals?: number): Promise<TokenBalance> {

    const provider = getProvider(chainId);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

    if (typeof decimals === "undefined" || !Number.isFinite(decimals)) {
        const preDecimals = await contract.decimals();
        decimals = Number(preDecimals);
    }
    const balance = await contract.balanceOf(address);
    const balanceClean = (BigNumber(balance).div(BigNumber(10).pow(BigNumber(decimals)))).toNumber();
    return {
        balance: balance.toString(),
        balanceClean,
        decimals
    };
}

export {
    getBalance,
    getTokenInfo
}
