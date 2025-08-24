import { inject, Inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CustomToastrService, ToastrPosition, ToastrType } from '../common/custom.toastr.service';

type Group = string;

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub?: signalR.HubConnection;
  private toastrService = inject(CustomToastrService);
  // Event adı -> Subject eşlemesi (çoklu akış)
  private subjects = new Map<string, Subject<any>>();

  // Katıldığımız gruplar (reconnect sonrası tekrar join için)
  private joinedGroups = new Set<Group>();

  // Tek seferlik handler bağlama koruması
  private boundEvents = new Set<string>();

  // Varsayılan hub URL (server’daki MapHub ile birebir olmalı)
  public hubUrl = 'http://localhost:5217/crypto-hub';

  constructor() { }

  async startConnection(hubUrl?: string): Promise<void> {
    if (hubUrl) this.hubUrl = hubUrl;

    if (this.hub && (this.hub.state === signalR.HubConnectionState.Connected
      || this.hub.state === signalR.HubConnectionState.Connecting)) {
      return;
    }

    if (this.hub) {
      try {
        await this.hub.stop();
      } catch { }
    }

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => sessionStorage.getItem('accessToken') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hub.onreconnecting(() => {
      this.toastrService.showToastr("Tekrardan baglaniliyor", "Bilgilendirme", {
        position: ToastrPosition.TopRight,
        type: ToastrType.Info
      });
    });

    this.hub.onreconnected(async () => {
      for (const g of this.joinedGroups) {
        await this.safeInvokeJoin(g);
      }
    });

    this.hub.onclose(() => {
      console.log("Baglanti kapatiliyor");
    });
    await this.hub.start();
  }

  on<T = any>(methodName: string): Observable<T> {
    if (!this.subjects.has(methodName)) {
      this.subjects.set(methodName, new BehaviorSubject<T | null>(null) as Subject<T>);
    }
    const subj = this.subjects.get(methodName)!;

    if (!this.boundEvents.has(methodName)) {
      this.boundEvents.add(methodName);
      if (!this.hub) {
        console.warn('SignalR hub bağlantısı başlatılmadan on() çağrıldı. startConnection() çağır.');
      } else {
        this.hub.on(methodName, (payload: T) => {
          subj.next(payload);
        });
      }
    }

    return subj.asObservable();
  }


  async join(group: Group) {
    await this.safeInvokeJoin(group);
    this.joinedGroups.add(group);
  }

  async leave(group: Group) {
    if (!this.hub) return;
    await this.hub.invoke('Leave', group);
    this.joinedGroups.delete(group);
  }

  async stopConnection(): Promise<void> {
    if (!this.hub) return;
    try {
      await this.hub.stop();
    } finally {
      this.boundEvents.clear();
      this.subjects.clear();
      this.joinedGroups.clear();
    }
  }

  marketAllTrades(): Group { return 'market_trades' }
  trade(symbol: string): Group { return `trade_${symbol.toUpperCase()}`; }
  depth(symbol: string): Group { return `depth_${symbol.toUpperCase()}`; }
  kline(symbol: string, interval: string): Group { return `kline_${symbol.toUpperCase()}_${interval.toLowerCase()}`; }

  // ---- Private helpers ----
  private async safeInvokeJoin(group: Group) {
    if (!this.hub) throw new Error('Hub bağlantısı yok. startConnection() çağır.');
    await this.hub.invoke('Join', group);
  }
}
