export interface CreateAssetContract {
    source: string;
    code: string
    assetClass: string;
    isActive: boolean;
    isVisibleForNonLogin: boolean;
}


// public string Source { get; set; } // "BINANCE", "NASDAQ"...
// public string Code { get; set; }
// public string AssetClass { get; set; }