export interface GraphQuote {
    symbol: string;
    closeTime: Date;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
    volume: number;
    quoteAssetVolume: number;
    numberOfTrades: number;
    isClosed: boolean;
}

