import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DepositDto } from '../../../../contract/transaction/DepositTransactionDto';
import { AssetService } from '../../../../services/models/asset/asset.service';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../services/common/custom.toastr.service';
import { PagedResult } from '../../../../contract/helpers/PagedResult';
import { GetTransactionDetailResponse } from '../../../../contract/transaction/GetTransactionDetailResponse';
import { PrettyNumberPipe } from "./helper/pretty-number.pipe";
import { UserHoldingsListItemContract } from '../../../../contract/user/admin/user/UserHoldingsListItemContract';
import { SignalRService } from '../../../../services/signalR/signal-r.service';
import { Subscription, switchMap, timer } from 'rxjs';
import { CryptoQuote } from '../../../../contract/market/common/crypto/CryptoQuote';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule, PrettyNumberPipe],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnInit, OnDestroy {

  depositAmount: number | null = null;
  transactionHistory?: PagedResult<GetTransactionDetailResponse>
  balance: number = 0;
  signalRService = inject(SignalRService)
  router = inject(Router)
  private assetService = inject(AssetService);
  private toastrService = inject(CustomToastrService);
  totalPortfolioValue: number = 0;
  portfolioChangePercent: number = 0;
  holdings!: UserHoldingsListItemContract[];

  private assetPollSubscription!: Subscription;
  async ngOnInit(): Promise<void> {
    await this.getTransactionHistory();
    await this.startAssetPolling();
  }
  async startAssetPolling() {
    const POLLING_INTERVAL = 1000;
    this.assetPollSubscription = timer(0, POLLING_INTERVAL)
      .pipe(
        switchMap(async () =>
          await this.assetService.getUserAssets())
      ).subscribe(response => {
        if (response.succeeded) {
          let profitOrLoss = 0;
          let buyPrice = 0;
          let currentPrice = 0;

          this.holdings = response.data?.items ?? [];
          this.holdings.forEach(h => {
            this.transactionHistory?.items.forEach(th => {
              if (th.symbol === h.symbol) {
                th.currentAssetPrice = h.currentPrice;
              }
            })
            profitOrLoss += h.profitLoss;
            buyPrice += h.quantity * h.averageCost;
            currentPrice += h.quantity * h.currentPrice;
          });
          this.portfolioChangePercent = (buyPrice > 0 ? profitOrLoss / buyPrice : 0) * 100;
          this.totalPortfolioValue = currentPrice;
          console.log("veriler guncellendi")
        } else {
          this.toastrService.showToastr("Guncel kar/zarar durumu guncellenirken bir hata meydana geldi", "Hata", {
            position: ToastrPosition.TopRight,
            type: ToastrType.Warning
          });
        }
      });

  }

  calcTxnPnl(d: GetTransactionDetailResponse): number {
    if (d.type !== 'BUY' || d.currentAssetPrice == null) return 0;
    const pnl = (d.currentAssetPrice - d.price) * d.quantity;
    return Number.isFinite(pnl) ? pnl : 0;
  }

  pnlClass(v: number): string {
    if (v > 0) return 'text-success';
    if (v < 0) return 'text-error';
    return 'text-base-content/60';
  }


  ngOnDestroy(): void {
    if (this.assetPollSubscription) {
      this.assetPollSubscription.unsubscribe();
    }
  }

  navigateDetails(symbol: string) {
    this.router.navigateByUrl(`market/details/${symbol}`)
  }


  async makeDeposit(depositAmount: number | null) {
    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      this.toastrService.showToastr('Lutfen gecerli bir miktar giriniz.', 'Uyari', {
        position: ToastrPosition.TopRight,
        type: ToastrType.Warning
      });
      return;
    }
    let cashDeposit: DepositDto = {
      code: 'USDT',
      transactionType: 'DEPOSIT',
      price: amount
    }
    const response = await this.assetService.depositMoney(cashDeposit);
    if (response.succeeded) {
      this.toastrService.showToastr(response.message, 'Success', {
        position: ToastrPosition.TopRight,
        type: ToastrType.Succes
      });
    }
    this.depositAmount = null;
    await this.getTransactionHistory();
  }

  async getTransactionHistory() {
    const response = await this.assetService.getTransactionHistory();
    if (response.succeeded) {
      this.transactionHistory = response.data!;
      this.transactionHistory.items.sort(
        (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
      );
      this.balance = this.transactionHistory!.items.reduce((acc, transaction) => {
        if (transaction.type === 'DEPOSIT') {
          return acc + transaction.quantity;
        } else if (transaction.type === "BUY") {
          return acc - (transaction.quantity * transaction.price);
        } else if (transaction.type === 'SELL') {
          return acc + (transaction.price * transaction.quantity);
        }
        return acc;
      }, 0);
    } else {
      this.toastrService.showToastr('Islem gecmisi bulunamadi.', 'Warning', {
        position: ToastrPosition.TopRight,
        type: ToastrType.Warning
      });
      this.transactionHistory = { items: [], totalCount: 0, page: 1, pageSize: 5 };
      this.balance = 0;
    }
  }

}



