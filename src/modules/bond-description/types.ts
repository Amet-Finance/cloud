type BondDescriptionCache = {
    [contractId: string]: BondDescription
}


type ContractDescription = {
    name: string,
    description: string,
    external_url: string,
    image: string,
    details?: {
        title: string,
        description: string
    }
}


type BondDescription = ContractDescription & {
    cacheTime: Date
}

export type {
    BondDescriptionCache,
    BondDescription,
    ContractDescription
}
