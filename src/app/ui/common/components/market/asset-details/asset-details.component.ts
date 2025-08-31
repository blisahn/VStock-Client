import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../../../../services/signalR/signal-r.service';
import { CryptoQuote } from '../../../../../contract/market/common/crypto/CryptoQuote';
import { OrderQuote } from '../../../../../contract/market/common/crypto/OrderQuote';
import { RecentTrade } from '../../../../../contract/market/common/crypto/RecentTrade';
import { GraphComponent } from "../graph/graph/graph.component";
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../../../services/models/asset/asset.service';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../services/common/custom.toastr.service';
import { AssetDto } from '../../../../../contract/market/actions/AssetDto';

type DepthRow = { price: number; quantity: number; total: number; cum: number; perc: number };

@Component({
  selector: 'app-asset-details',
  imports: [CommonModule, GraphComponent, FormsModule],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.css',
  standalone: true,
})
export class AssetDetailsComponent implements OnInit, OnDestroy {
  symbol: string | null = null;
  cryptoQuote?: CryptoQuote;
  orderQuote?: OrderQuote;
  recentTrades?: RecentTrade[] = [];
  buyQuantity: number = 0;
  buySliderValue: number = 0;
  sellSliderValue: number = 0;
  private maxTrades = 20;

  asksView: DepthRow[] = [];
  bidsView: DepthRow[] = [];
  maxCumAsk = 0;
  maxCumBid = 0;

  private lastTradeKey = '';
  private tradeBuffer: RecentTrade[] = [];
  private bufferTimeout?: any;

  selectedPrice?: number;
  selectedQty?: number;

  private subs: Subscription[] = [];
  sellQuantity: any;


  constructor(private route: ActivatedRoute, private signalR: SignalRService, private assetService: AssetService, private toastrService: CustomToastrService) { }

  async ngOnInit() {
    this.symbol = this.route.snapshot.paramMap.get('symbol');
    if (!this.symbol) return;

    await this.signalR.startConnection('http://localhost:5217/private-crypto-hub');

    await this.signalR.join(this.signalR.trade(this.symbol));
    await this.signalR.join(this.signalR.depth(this.symbol));

    this.subs.push(
      this.signalR.on('ReceiveBinanceTradeDataUpdateNotification')
        .subscribe(d => {
          if (!d) return;

          const tradeKey = `${d.price}-${d.quantity}-${d.retrievedAt}`;
          if (this.lastTradeKey === tradeKey) {
            return;
          }
          this.lastTradeKey = tradeKey;

          this.cryptoQuote = d;
          const side: 'buy' | 'sell' = d.side === 0 || d.side === 'Buy' ? 'buy' : 'sell';

          const row: RecentTrade = {
            price: d.price,
            quantity: d.quantity,
            time: new Date(d.retrievedAt).toLocaleString('tr-TR', {
              timeZone: 'Europe/Istanbul',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              fractionalSecondDigits: 2
            }),
            side
          };

          this.tradeBuffer.push(row);

          if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
          }
          this.bufferTimeout = setTimeout(() => {
            this.processTradeBatch();
          }, 50);
        })
    );

    this.subs.push(
      this.signalR.on<OrderQuote>('ReceiveBinanceDepthDataUpdateNotification')
        .subscribe(d => {
          if (!d) return;
          this.orderQuote = d;
          this.buildDepthViews(d);
        })
    );

  }

  ngOnDestroy() {
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }

    this.subs.forEach(s => s.unsubscribe());
    if (this.symbol) {
      this.signalR.leave(this.signalR.trade(this.symbol));
      this.signalR.leave(this.signalR.depth(this.symbol));
    }
  }

  private processTradeBatch() {
    if (this.tradeBuffer.length === 0) return;

    this.recentTrades!.unshift(...this.tradeBuffer);

    if (this.recentTrades!.length > this.maxTrades) {
      this.recentTrades = this.recentTrades!.slice(0, this.maxTrades);
    }
    this.tradeBuffer = [];
  }
  onBuySliderChange(value: number): void {
    this.buySliderValue = value;
    this.buyQuantity = parseFloat((value / 100).toFixed(2));
  }
  onBuyQuantityChange(value: number): void {
    this.buyQuantity = value;
    this.buySliderValue = Math.round(value * 100);
  }

  onSellQuantityChange(value: number): void {
    this.sellQuantity = value;
    this.sellSliderValue = Math.round(value * 100);
  }
  onSellSliderChange(value: number): void {
    this.sellSliderValue = value;
    this.sellQuantity = parseFloat((value / 100).toFixed(2));
  }
  private buildDepthViews(d: OrderQuote) {
    const asks = [...(d.asks || [])].sort((a, b) => a.price - b.price).slice(0, 15);
    const bids = [...(d.bids || [])].sort((a, b) => b.price - a.price).slice(0, 15);

    let cum = 0;
    const asksView: DepthRow[] = asks.map(x => {
      const total = x.price * x.quantity;
      cum += x.quantity;
      return { price: x.price, quantity: x.quantity, total, cum, perc: 0 };
    });
    this.maxCumAsk = asksView.at(-1)?.cum ?? 0;
    asksView.forEach(r => r.perc = this.maxCumAsk ? (r.cum / this.maxCumAsk) * 100 : 0);

    cum = 0;
    const bidsView: DepthRow[] = bids.map(x => {
      const total = x.price * x.quantity;
      cum += x.quantity;
      return { price: x.price, quantity: x.quantity, total, cum, perc: 0 };
    });
    this.maxCumBid = bidsView.at(-1)?.cum ?? 0;
    bidsView.forEach(r => r.perc = this.maxCumBid ? (r.cum / this.maxCumBid) * 100 : 0);

    this.asksView = asksView;
    this.bidsView = bidsView;
  }

  get bestAsk(): number | undefined { return this.asksView[0]?.price; }
  get bestBid(): number | undefined { return this.bidsView[0]?.price; }
  get spread(): number | undefined {
    if (this.bestAsk == null || this.bestBid == null) return undefined;
    return this.bestAsk - this.bestBid;
  }
  get mid(): number | undefined {
    if (this.bestAsk == null || this.bestBid == null) return undefined;
    return (this.bestAsk + this.bestBid) / 2;
  }

  trackByPrice = (_: number, r: DepthRow) => r.price;
  trackTrade = (_: number, t: RecentTrade) => `${t.time}-${t.price}-${t.quantity}`;

  pick(price: number, qty: number) {
    this.selectedPrice = price;
    this.selectedQty = qty;
  }

  async buyAsset() {
    const buyAssetDto: AssetDto = {
      symbol: this.symbol!,
      amount: this.buyQuantity,
      assetClass: "CRYPTO"
    };
    const res = await this.assetService.buyAsset(buyAssetDto);
    if (res.succeeded) {
      this.toastrService.showToastr(res.message, "Satin alimi gerceklesti", {
        type: ToastrType.Succes,
        position: ToastrPosition.TopCenter
      });
    }
  }

  async sellAsset() {
    const sellAssetDto: AssetDto = {
      symbol: this.symbol!,
      amount: this.sellQuantity,
      assetClass: 'CRYPTO'
    };
    const res = await this.assetService.selAsset(sellAssetDto);
    if (res.succeeded) {
      this.toastrService.showToastr(res.message, "Satis islemi gerceklesti", {
        type: ToastrType.Succes,
        position: ToastrPosition.TopCenter
      });
    }
  }


}