import {getProvider} from "../../utils";
import {ethers} from "ethers";
import ZeroCouponBondsV1_AmetFinance
    from './abi/contracts_zcb-v1_ZeroCouponBondsV1_AmetFinance_sol_ZeroCouponBondsV1_AmetFinance.json'

function getContract(chainId: number, contractAddress: string) {
    const provider = getProvider(chainId);
    return new ethers.Contract(contractAddress, ZeroCouponBondsV1_AmetFinance, provider);
}


const ZeroCouponBondsV1 = {}

export default ZeroCouponBondsV1;
