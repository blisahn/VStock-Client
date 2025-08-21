import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import { GraphQuote } from "../../../../../../contract/market/common/GraphQuote";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  UTCTimestamp,
} from 'lightweight-charts';
import { CommonModule } from "@angular/common";
import { CustomHttpClient } from "../../../../../../services/common/customhttp.service";
import { SocketService } from "../../../../../../services/models/socket/socket.service";
import { CustomToastrService, ToastrPosition, ToastrType } from "../../../../../../services/common/custom.toastr.service";
import { ToastrService } from "ngx-toastr";
import { Timestamp } from "rxjs";

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() data?: GraphQuote;
  @Input() symbol?: string | null;
  @Input() interval?: string | null;

  @ViewChild('assetChart', { static: true }) assetChartRef!: ElementRef<HTMLDivElement>;

  private chart?: IChartApi;
  private candlestickSeries?: ISeriesApi<'Candlestick'>;
  private candleData: CandlestickData[] = [];
  private resizeObserver?: ResizeObserver;


  constructor(private socketService: SocketService, private toastrService: CustomToastrService) {

  }

  async ngAfterViewInit(): Promise<void> {
    const currentTimeStamp = Math.floor(Date.now() / 1000) as UTCTimestamp;

    const exactOneDayBeforeTimeStamp = currentTimeStamp - 20000;
    var res = (await this.socketService.getHistoricalKlines(
      this.symbol!,
      this.interval!,
      exactOneDayBeforeTimeStamp,
      currentTimeStamp,
      500));
    this.toastrService.showToastr(res.message, "Basarili islem", {
      type: ToastrType.Succes,
      position: ToastrPosition.TopRight
    })
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
    const candlestickData: CandlestickData[] = Array.isArray(res.data)
      ? res.data.flat().map((quote: GraphQuote) => ({
        time: Math.floor((new Date(quote.openTime).getTime() + (3 * 60 * 60 * 1000)) / 1000) as UTCTimestamp,
        open: quote.openPrice,
        high: quote.highPrice,
        low: quote.lowPrice,
        close: quote.closePrice,
      }))
      : [];
    this.candlestickSeries.setData(candlestickData);
    this.candleData = candlestickData;
    if (this.data) this.updateChart(this.data);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data']?.currentValue && this.candlestickSeries)) {
      this.updateChart(changes['data'].currentValue as GraphQuote);
    }
  }

  private updateChart(quote: GraphQuote): void {
    if (!this.candlestickSeries || !quote) return;


    const candle: CandlestickData = {
      time: Math.floor((new Date(quote.openTime).getTime() + (3 * 60 * 60 * 1000)) / 1000) as UTCTimestamp,
      open: quote.openPrice,
      high: quote.highPrice,
      low: quote.lowPrice,
      close: quote.closePrice,
    };

    if (this.candleData.length === 0) {
      this.candleData.push(candle);
      this.candlestickSeries.update(candle);
      return;
    }

    const last = this.candleData[this.candleData.length - 1];
    if (last && last.time === candle.time) {
      this.candleData[this.candleData.length - 1] = candle;
      this.candlestickSeries.update(candle);
    } else if (!last || (last.time as number) < (candle.time as number)) {
      this.candleData.push(candle);
      this.candlestickSeries.update(candle);
    } else {
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.remove();
  }
}
