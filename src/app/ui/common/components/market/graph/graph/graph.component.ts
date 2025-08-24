import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { GraphQuote } from "../../../../../../contract/market/common/GraphQuote";
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, UTCTimestamp, } from 'lightweight-charts';
import { CommonModule } from "@angular/common";
import { SocketService } from "../../../../../../services/models/socket/socket.service";
import { CustomToastrService, ToastrPosition, ToastrType } from "../../../../../../services/common/custom.toastr.service";
import { SignalRService } from "../../../../../../services/signalR/signal-r.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() symbol?: string | null;
  interval = '1m';

  @ViewChild('assetChart', { static: true }) assetChartRef!: ElementRef<HTMLDivElement>;

  private chart?: IChartApi;
  private candlestickSeries?: ISeriesApi<'Candlestick'>;
  private candleData: CandlestickData[] = [];
  private resizeObserver?: ResizeObserver;
  private subs: Subscription[] = [];


  constructor(
    private socketService: SocketService,
    private signalR: SignalRService,
    private toastrService: CustomToastrService) {

  }
  ngOnInit(): void {
    this.subs.push(
      this.signalR.on<GraphQuote>('ReceiveBinanceKlineDataUpdateNotification')
        .subscribe(quote => {
          if (quote && this.candlestickSeries) {
            this.updateChart(quote);
          }
        })
    );
  }





  async ngAfterViewInit(): Promise<void> {
    if (!this.symbol) return;
    this.intiializeChart();
    await this.loadHistoricalDataAndJoinGroup();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.remove();
    this.subs.forEach(s => s.unsubscribe());
    if (this.symbol) {
      this.signalR.leave(this.signalR.kline(this.symbol, this.interval));
    }
  }

  async setInterval(newInterval: string) {
    if (!this.symbol || this.interval === newInterval) return;
    await this.signalR.leave(this.signalR.kline(this.symbol!, this.interval));
    this.interval = newInterval;
    await this.loadHistoricalDataAndJoinGroup();
  }

  private intiializeChart(): void {
    const el = this.assetChartRef?.nativeElement;
    if (!el) return;

    this.chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 384,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        borderColor: '#485C7B',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        this.chart?.applyOptions({ width: cr.width, height: cr.height });
      }
    });
    this.resizeObserver.observe(el);
  }

  private updateChart(quote: GraphQuote): void {
    if (!this.candlestickSeries) return;

    const candle: CandlestickData = {
      time: Math.floor(new Date(quote.openTime).getTime() / 1000) as UTCTimestamp,
      open: quote.openPrice,
      high: quote.highPrice,
      low: quote.lowPrice,
      close: quote.closePrice,
    };

    this.candlestickSeries.update(candle);
  }


  async loadHistoricalDataAndJoinGroup(): Promise<void> {
    if (!this.symbol || !this.candlestickSeries) return;
    this.candleData = [];
    this.candlestickSeries.setData([]);
    const currentTimeStamp = Math.floor(Date.now() / 1000) as UTCTimestamp;
    let diff = 0;
    if (this.interval === "1m") diff = 500 * 60;
    else if (this.interval === "15m") diff = 500 * 60 * 15;
    else if (this.interval === "1h") diff = 500 * 60 * 60;

    const before = currentTimeStamp - diff;

    const res = await this.socketService.getHistoricalCrpytoKlines(
      this.symbol, this.interval, before, currentTimeStamp, 500
    );

    const candlestickData: CandlestickData[] = Array.isArray(res.data)
      ? res.data.flat().map((quote: GraphQuote) => ({
        time: Math.floor(new Date(quote.openTime).getTime() / 1000) + 10800 as UTCTimestamp,
        open: quote.openPrice,
        high: quote.highPrice,
        low: quote.lowPrice,
        close: quote.closePrice,
      }))
      : [];

    this.candlestickSeries.setData(candlestickData);
    this.candleData = candlestickData;

    // Veri yüklendikten sonra anlık güncellemeler için gruba katıl
    await this.signalR.join(this.signalR.kline(this.symbol, this.interval));
    this.toastrService.showToastr(`${this.symbol} için ${this.interval} verisi yüklendi.`, "Grafik Hazır", {
      type: ToastrType.Succes,
      position: ToastrPosition.TopRight
    });
  }
}
