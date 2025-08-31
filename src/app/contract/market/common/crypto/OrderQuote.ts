export interface OrderQuote {
    symbol: string;
    bids: Array<{ price: number; quantity: number }>;
    asks: Array<{ price: number; quantity: number }>;

}