type AddressRawData = {
    _id: string;
    xp?: number;
    active?: boolean;
    ref?: string;
    code?: string;
    twitter?: Social,
    discord?: Social
    lastUpdated?: Date
};

type Social = {
    id: string
    username: string
}

export type  {
    AddressRawData
}
