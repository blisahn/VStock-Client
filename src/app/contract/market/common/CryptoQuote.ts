export interface CryptoQuote {
    symbol: string;
    price: number;
    retrievedAt: Date;
    isUpdated: boolean;
    quantity: number; // Optional field for quantity
}