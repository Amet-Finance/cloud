type ReportBody = {
    name?: string;
    email?: string;
    telegram?: string;
    description?: string;
    contractAddress: string,
    chainId: number
};

type ReportRawData = ReportBody & {
    address: string;
    contractAddress: string;
    chainId: number;
    createdAt: Date
};

export type { ReportBody, ReportRawData };
