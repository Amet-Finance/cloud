import {BondDescriptionCache} from "./types";
import {Description} from "../../controllers/contract/v1/types";
import axios from "axios/index";
import {BUCKET_NAME} from "../../controllers/contract/v1/contstants";

const HOUR_CACHE = 60 * 60 * 1000;

let bondDescription: BondDescriptionCache = {}

async function getDescription(contractAddress: string) {

    const contractLower = contractAddress.toLowerCase();
    if (bondDescription[contractLower]) {
        if (Date.now() - bondDescription[contractLower].cacheTime.getTime() <= HOUR_CACHE) {
            return bondDescription[contractLower];
        }
    }
    return getDescriptionFromAPI(contractAddress);
}

async function getDescriptionFromAPI(contractAddress: string): Promise<Description> {
    const bondContractAddress = contractAddress.toLowerCase();
    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${bondContractAddress}.json`)
    return response.data;
}


const BondDescriptionService = {
    getDescription
}
export default BondDescriptionService;
