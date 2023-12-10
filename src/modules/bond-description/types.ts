type BondDescriptionCache = {
    [contractAddress: string]: BondDescription
}

type BondDescription = {
    name: string,
    description: string;
    external_url: string,
    image: string,
    details: {
        title: string,
        description: string
    },
    cacheTime: Date
}

export type {
    BondDescriptionCache,
    BondDescription
}
