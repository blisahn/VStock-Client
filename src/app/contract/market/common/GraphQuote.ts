export interface GraphQuote {
    eventTime: number;
    symbol: string;
    openTime: Date;
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

// { "type": 1, "target": "ReceiveBinanceKlineDataUpdateNotification",
// "arguments": [{ "eventTime": 1755776536030, "symbol": "BTCUSDT", "openTime": "2025-08-21T11:42:00Z", "closeTime": "2025-08-21T11:42:59.999Z",
//  "openPrice": 113319.99000000, "highPrice": 113344.05000000, "lowPrice": 113319.99000000, "closePrice": 113344.05000000, "volume": 2.95509000,
// "quoteAssetVolume": 334902.02169070, "numberOfTrades": 842, "isClosed": false }] }{ "type": 1, "target": "ReceiveBinanceKlineDataUpdateNotification",
//  "arguments": [{ "eventTime": 1755776536030, "symbol": "BTCUSDT", "openTime": "2025-08-21T11:42:00Z", "closeTime": "2025-08-21T11:42:59.999Z", "openPrice": 113319.99000000,
//  "highPrice": 113344.05000000, "lowPrice": 113319.99000000, "closePrice": 113344.05000000, "volume": 2.95509000, "quoteAssetVolume": 334902.02169070, "numberOfTrades": 842,
// "isClosed": false }] }