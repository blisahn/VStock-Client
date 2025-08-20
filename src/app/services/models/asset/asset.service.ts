import { Injectable } from "@angular/core";
import { CustomHttpClient } from "../../common/customhttp.service";
import { TransactionDto } from "../../../contract/transaction/DepositTransactionDto";
import { BaseApiResponse } from "../../../contract/helpers/BaseApiResponse";
import { firstValueFrom } from "rxjs";
import { GetUserTransactionResponse as GetUserTransactionResponseDto } from "../../../contract/transaction/GetTransactionResponseDto";

@Injectable({
    providedIn: 'root'
})
export class AssetService {
    constructor(private customHttpClient: CustomHttpClient) { }
    async create(transactionDto: TransactionDto): Promise<BaseApiResponse> {
        try {
            const observable = this.customHttpClient.post<BaseApiResponse, TransactionDto>({
                controller: 'transaction',
                action: 'createtransaction'
            }, transactionDto);
            const res = await firstValueFrom(observable);
            return res;
        } catch (err) {
            throw err;
        }
    }

    async depositMoney(transactionDto: TransactionDto): Promise<BaseApiResponse> {
        try {
            const observable = this.customHttpClient.post<BaseApiResponse, TransactionDto>({
                controller: 'transaction',
                action: 'createtransaction'
            }, transactionDto);
            const res = await firstValueFrom(observable);
            return res;
        } catch (err) {
            throw err;
        }
    }

    async getTransactionHistory(): Promise<BaseApiResponse<GetUserTransactionResponseDto>> {
        try {
            const observable = this.customHttpClient.get<BaseApiResponse<GetUserTransactionResponseDto>>({
                controller: 'transaction',
                action: 'getTransactions'
            });
            const res = await firstValueFrom(observable);
            return res;
        } catch (err) {
            throw err;
        }
    }
}