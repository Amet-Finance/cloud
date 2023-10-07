import ZCB_ABI from './abi-jsons/ZCB_V1.json'
import ERC_20 from './abi-jsons/ERC20.json'
import {getWeb3} from "../../modules/web3/utils";

async function getInfo(chainId: string, contractAddress: string) {
    const web3 = getWeb3(chainId)
    const contract = new web3.eth.Contract(ZCB_ABI as any, contractAddress);
    const info = await contract.methods.getInfo().call();
    return {
        _id: contractAddress,
        issuer: info[0],
        total: Number(info[1]),
        purchased: Number(info[2]),
        redeemed: Number(info[3]),
        redeemLockPeriod: Number(info[4]),
        investmentToken: info[5],
        investmentTokenAmount: info[6],
        interestToken: info[7],
        interestTokenAmount: info[8],
        feePercentage: Number(info[9]),
        issuanceDate: Number(info[10])
    };
}

async function getTokenInfo(chainId:string,contractAddress: string) {
    try {
        const web3 = getWeb3(chainId);

        const contract = new web3.eth.Contract(ERC_20 as any, contractAddress);

        const name = await contract.methods.name().call();
        const symbol = await contract.methods.symbol().call();
        const decimals = await contract.methods.decimals().call();

        return {
            _id: contractAddress.toLowerCase(),
            name,
            symbol,
            decimals: Number(decimals)
        };
    } catch (e) {
        return
    }
}

export {
    getInfo,
    getTokenInfo
}