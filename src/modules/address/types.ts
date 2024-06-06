type AddressRawData = {
    _id: string;
    xp?: number;
    active?: boolean;
    ref?: string;
    code?: string;
    twitter?: TwitterConnection;
    discord?: DiscordConnection;
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
    twitter?: TwitterConnection;
    discord?: DiscordConnection;
    lastUpdated?: Date;
    createdAt?: Date;
    email?: string;
    emailCode?: string;
    emailPending?: string;
    gitcoinScore?: number;
};

type TwitterConnection = {
    id: string;
    username: string;
};

type DiscordConnection = {
    id: string;
    username: string;
    ametConnected?: boolean;
    huntConnected?: boolean;
};

export type { AddressRawData, AddressResponse, DiscordConnection, TwitterConnection };
