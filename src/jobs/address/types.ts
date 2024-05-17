type CustomReward = {
    address: string;
    type: 'article' | 'video' | 'tutorial' | 'infographics' | 'other';
    reward: number;
    link: string;
};

export type { CustomReward };
