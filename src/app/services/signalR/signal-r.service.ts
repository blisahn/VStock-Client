import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

type Group = string;

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub?: signalR.HubConnection;

  // Event adı -> Subject eşlemesi (çoklu akış)
  private subjects = new Map<string, Subject<any>>();

  // Katıldığımız gruplar (reconnect sonrası tekrar join için)
  private joinedGroups = new Set<Group>();

  // Tek seferlik handler bağlama koruması
  private boundEvents = new Set<string>();

  // Varsayılan hub URL (server’daki MapHub ile birebir olmalı)
  public hubUrl = 'http://localhost:5217/crypto-hub';

  constructor() { }

  /** Bağlantıyı başlat; tekrar çağrılırsa mevcut bağlantıyı korur */
  async startConnection(hubUrl?: string): Promise<void> {
    if (hubUrl) this.hubUrl = hubUrl;

    if (this.hub && (this.hub.state === signalR.HubConnectionState.Connected
      || this.hub.state === signalR.HubConnectionState.Connecting)) {
      return; // zaten açık/bağlanıyor
    }

    // Mevcut bağlantıyı kapat (varsa)
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

    // Reconnect eventleri
    this.hub.onreconnecting(() => {
      // İstersen UI’da “yeniden bağlanıyor” gösterebilirsin
    });

    this.hub.onreconnected(async () => {
      // Gruplara yeniden katıl
      for (const g of this.joinedGroups) {
        await this.safeInvokeJoin(g);
      }
    });

    this.hub.onclose(() => {
      // İsteğe bağlı: kapandı uyarısı
    });

    await this.hub.start();
  }

  /** Bir SignalR event’i için Observable döndürür ve gerekirse handler’ı bağlar */
  on<T = any>(methodName: string): Observable<T> {
    if (!this.subjects.has(methodName)) {
      this.subjects.set(methodName, new BehaviorSubject<T | null>(null) as Subject<T>);
    }
    const subj = this.subjects.get(methodName)!;

    // Handler'ı yalnızca bir defa bağla
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

  /** Event handler’ını kaldır (isteğe bağlı temizlik) */
  off(methodName: string) {
    if (!this.hub) return;
    this.hub.off(methodName);
    this.boundEvents.delete(methodName);
    this.subjects.delete(methodName);
  }

  /** Grup yönetimi */
  async join(group: Group) {
    await this.safeInvokeJoin(group);
    this.joinedGroups.add(group);
  }

  async leave(group: Group) {
    if (!this.hub) return;
    await this.hub.invoke('Leave', group);
    this.joinedGroups.delete(group);
  }

  /** Tüm bağlantıyı durdur */
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

  // ---- Yardımcılar: Sözleşmeli grup adları ----
  marketAllTrades(): Group { return 'market:trade:ALL'; }
  trade(symbol: string): Group { return `binance:trade:${symbol}`; }
  depth(symbol: string): Group { return `binance:depth:${symbol}`; }
  kline(symbol: string, interval: string): Group { return `binance:kline:${symbol}:${interval}`; }

  // ---- Private helpers ----
  private async safeInvokeJoin(group: Group) {
    if (!this.hub) throw new Error('Hub bağlantısı yok. startConnection() çağır.');
    await this.hub.invoke('Join', group);
  }
}
