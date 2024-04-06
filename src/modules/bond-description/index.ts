import {BondDescription, BondDescriptionCache, ContractDescription} from "./types";
import axios from "axios";
import {BUCKET_NAME} from "./constants";


const HOUR_CACHE = 60 * 60 * 1000;

let bondDescription: BondDescriptionCache = {}

async function get(contractId: string) {

    const contractLower = contractId.toLowerCase();
    if (bondDescription[contractLower]) {
        if (Date.now() - bondDescription[contractLower].cacheTime.getTime() <= HOUR_CACHE) return bondDescription[contractLower];
    }
    return getDescriptionFromAPI(contractLower);
}

async function getDescriptionFromAPI(contractId: string): Promise<ContractDescription> {
    const response = await axios.get(`https://${BUCKET_NAME}/contracts/${contractId}.json`)
    update(contractId, response.data)
    return response.data;
}

function update(contractId: string, description: BondDescription) {
    bondDescription[contractId] = {...description, cacheTime: new Date()}
}


const BondDescriptionService = {
    get,
    update
}
export default BondDescriptionService;
