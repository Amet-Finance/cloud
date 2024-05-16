type AddressRawData = {
    _id: string;
    xp?: number;
    active?: boolean;
    ref?: string;
    code?: string;
    twitter?: Social;
    discord?: Social;
    lastUpdated?: Date;
    email?: string;
    emailCode?: string;
    emailPending?: string;
};

type AddressResponse = {
    _id: string;
    xp?: number;
    active?: boolean;
    ref?: string;
    code?: string;
    twitter?: Social;
    discord?: Social;
    lastUpdated?: Date;
    createdAt?: Date;
    email?: string;
    emailCode?: string;
    emailPending?: string;
};

type Social = {
    id: string;
    username: string;
};

export type { AddressRawData, AddressResponse };
