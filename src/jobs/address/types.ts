type CustomReward = {
    address: string;
    type: 'article' | 'video' | 'tutorial' | 'infographics' | 'donation' | 'other';
    reward: number;
    link: string;
};

export type { CustomReward };
