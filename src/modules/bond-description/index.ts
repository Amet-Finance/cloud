import {BondDescriptionCache} from "./types";
import axios from "axios";
import {ContractDescription} from "../../controllers/contract/v2/types";
import {BUCKET_NAME} from "../../controllers/contract/v2/constants";

const HOUR_CACHE = 60 * 60 * 1000;

let bondDescription: BondDescriptionCache = {}

async function get(contractAddress: string, chainId: string) {

    const contractLower = contractAddress.toLowerCase();
    if (bondDescription[contractLower]) {
        if (Date.now() - bondDescription[contractLower].cacheTime.getTime() <= HOUR_CACHE) {
            return bondDescription[contractLower];
        }
    }
    return getDescriptionFromAPI(contractLower);
}

async function getDescriptionFromAPI(contractAddress: string): Promise<ContractDescription> {
    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${contractAddress}.json`)
    bondDescription[contractAddress] = {
        ...response.data,
        cacheTime: new Date()
    } // todo rewrite this part, include chainId as well
    return response.data;
}


const BondDescriptionService = {
    get
}
export default BondDescriptionService;
