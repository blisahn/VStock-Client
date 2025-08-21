import { Component, OnDestroy, OnInit, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SignalRService } from '../../../../../services/signalR/signal-r.service';
import { CryptoQuote } from '../../../../../contract/market/common/CryptoQuote';
import { GraphQuote } from '../../../../../contract/market/common/GraphQuote';
import { OrderQuote } from '../../../../../contract/market/common/OrderQuote';
import { RecentTrade } from '../../../../../contract/market/common/RecentTrade';

type DepthRow = { price: number; quantity: number; total: number; cum: number; perc: number };

@Component({
  selector: 'app-asset-details',
  imports: [CommonModule],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.css'
})
export class AssetDetailsComponent implements OnInit, OnDestroy {
  symbol: string | null = null;
  interval = '1m';

  cryptoQuote?: CryptoQuote;
  graphQuote?: GraphQuote;
  orderQuote?: OrderQuote;
  recentTrades?: RecentTrade[] = [];
  private maxTrades = 20;
  // Görünüm için işlenmiş order book
  asksView: DepthRow[] = [];
  bidsView: DepthRow[] = [];
  maxCumAsk = 0; maxCumBid = 0;

  private lastTradeKey = '';
  private tradeBuffer: RecentTrade[] = [];
  private bufferTimeout?: any;

  // al/sat inputlarına veri basmak için
  selectedPrice?: number;
  selectedQty?: number;

  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute, private signalR: SignalRService) { }

  async ngOnInit() {
    this.symbol = this.route.snapshot.paramMap.get('symbol');
    if (!this.symbol) return;

    await this.signalR.startConnection('http://localhost:5217/crypto-hub');

    await this.signalR.join(this.signalR.trade(this.symbol));
    await this.signalR.join(this.signalR.depth(this.symbol));
    await this.signalR.join(this.signalR.kline(this.symbol, this.interval));

    this.subs.push(
      this.signalR.on('ReceiveBinanceTradeDataUpdateNotification')
        .subscribe(d => {
          if (!d) return;

          const tradeKey = `${d.price}-${d.quantity}-${d.retrievedAt}`;
          if (this.lastTradeKey === tradeKey) {
            // Aynı trade tekrar gelirse atla
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
          // if (isNaN(row.time as any)) {
          //   return;
          // }
          // this.recentTrades?.unshift(row);
          // if (this.recentTrades && this.recentTrades.length > this.maxTrades) {
          //   this.recentTrades = this.recentTrades.slice(0, this.maxTrades);
          // }
          this.tradeBuffer.push(row);

          // Clear existing timeout
          if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
          }
          // Process buffer after 50ms of no new trades
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

    this.subs.push(
      this.signalR.on<GraphQuote>('ReceiveBinanceKlineDataUpdateNotification')
        .subscribe(d => { if (!d) return; this.graphQuote = d; })
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
      this.signalR.leave(this.signalR.kline(this.symbol, this.interval));
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
  private buildDepthViews(d: OrderQuote) {
    // asks (sell) küçükten büyüğe, bids (buy) büyükten küçüğe
    const asks = [...(d.asks || [])].sort((a, b) => a.price - b.price).slice(0, 15);
    const bids = [...(d.bids || [])].sort((a, b) => b.price - a.price).slice(0, 15);

    // kümülatif
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
  trackTrade = (_: number, t: RecentTrade) => `${new Date(t.time).getTime()}-${t.price}-${t.quantity}`;

  pick(price: number, qty: number) {
    this.selectedPrice = price;
    this.selectedQty = qty;
    // burada form kontrolüne set edebilirsin; ör: this.buyForm.patchValue({ price, qty })
  }
}
