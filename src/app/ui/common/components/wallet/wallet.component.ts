import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { TransactionDto } from '../../../../contract/transaction/DepositTransactionDto';
import { AssetService } from '../../../../services/models/asset/asset.service';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../services/common/custom.toastr.service';
import { PagedResult } from '../../../../contract/helpers/PagedResult';
import { GetTransactionDetailResponse } from '../../../../contract/transaction/GetTransactionDetailResponse';

@Component({
    selector: 'app-wallet',
    imports: [CommonModule, FormsModule],
    templateUrl: './wallet.component.html',
    styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnInit {

  depositAmount: number | null = null;
  transactionHistory?: PagedResult<GetTransactionDetailResponse>
  balance: number = 0;

  private assetService = inject(AssetService);
  private toastrService = inject(CustomToastrService);

  async ngOnInit(): Promise<void> {
    await this.getTransactionHistory();
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
    let cashDeposit: TransactionDto = {
      symbol: 'TRY',
      transactionType: 'Deposit',
      quantity: 1,
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
      this.toastrService.showToastr('Islemler listelendi.', 'Success', {
        position: ToastrPosition.TopRight,
        type: ToastrType.Succes
      });
      this.transactionHistory = response.data!;
      this.balance = this.transactionHistory!.items.reduce((acc, transaction) => {
        if (transaction.type === 'Deposit') {
          return acc + transaction.price;
        } else if (transaction.type === 'Withdraw') {
          return acc - transaction.price;
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



