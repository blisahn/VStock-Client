export interface RecentTrade {
    price: number;
    quantity: number;
    time: string;
    side: 'buy' | 'sell';
}