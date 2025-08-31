import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalRService } from '../../../../services/signalR/signal-r.service';
import { CommonModule } from '@angular/common';
import { CryptoQuote } from '../../../../contract/market/common/crypto/CryptoQuote';
import { FormsModule } from "@angular/forms";
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserAuthService } from '../../../../services/models/user/user-auth.service';
import { AuthService } from '../../../../services/models/auth.service';

type Trend = 'up' | 'down' | 'same';

interface RowQuote extends CryptoQuote {
  _trend?: Trend;
  _flash?: 'up' | 'down' | null;
  _prevPrice?: number | null;
}

@Component({
  selector: 'app-market',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './market.component.html',
  styleUrl: './market.component.css'
})
export class MarketComponent implements OnInit, OnDestroy {
  marketData: RowQuote[] = [];
  lastUpdated: string | null = null;
  signalRKey: string | null = null;
  private subs: Subscription[] = [];

  constructor(private signalR: SignalRService, public authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    console.log("dusun bakem")
    this.subs.forEach(s => s.unsubscribe());
    this.signalR.leave(this.signalR.marketAllTrades());
    if (this.authService.isAuthenticated()) {
      await this.signalR.startConnection('http://localhost:5217/private-crypto-hub');
      this.signalRKey = 'ReceiveBinanceMarketData';
    } else {
      await this.signalR.startConnection('http://localhost:5217/public-crypto-hub');
      this.signalRKey = 'ReceivePublicBinanceMarketData';
    }

    await this.signalR.join(this.signalR.marketAllTrades());

    const sub = this.signalR
      .on<CryptoQuote>(this.signalRKey)
      .subscribe((incoming) => {
        if (!incoming) return;
        this.processIncomingData(incoming);
      });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.signalR.leave(this.signalR.marketAllTrades());
  }

  processIncomingData(incoming: CryptoQuote | any) {
    const retrieved = typeof incoming.retrievedAt === 'number'
      ? new Date(incoming.retrievedAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
      : new Date(incoming.retrievedAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const incomingRow: RowQuote = {
      ...incoming,
      retrievedAt: retrieved,
    };

    const idx = this.marketData.findIndex(d => d.symbol === incomingRow.symbol);
    if (idx !== -1) {
      const prev = this.marketData[idx];
      incomingRow._prevPrice = prev.price;

      if (incomingRow.price > (prev.price ?? 0)) {
        incomingRow._trend = 'up';
        incomingRow._flash = 'up';
      } else if (incomingRow.price < (prev.price ?? 0)) {
        incomingRow._trend = 'down';
        incomingRow._flash = 'down';
      } else {
        incomingRow._trend = 'same';
        incomingRow._flash = null;
      }
      this.marketData[idx] = incomingRow;
    } else {
      incomingRow._prevPrice = null;
      incomingRow._trend = 'same';
      incomingRow._flash = null;
      this.marketData.push(incomingRow);
    }

    this.lastUpdated = new Date().toLocaleString();
    this.marketData.sort((a, b) => a.symbol.localeCompare(b.symbol));

    setTimeout(() => {
      const i = this.marketData.findIndex(d => d.symbol === incomingRow.symbol);
      if (i !== -1) this.marketData[i]._flash = null;
    }, 300);
  }

  trackBySymbol = (_: number, item: RowQuote) => item.symbol;
}
