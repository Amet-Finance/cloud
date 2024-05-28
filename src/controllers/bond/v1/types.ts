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
};

export type { ReportBody, ReportRawData };
