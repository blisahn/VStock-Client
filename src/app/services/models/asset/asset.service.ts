import { Injectable } from "@angular/core";
import { CustomHttpClient } from "../../common/customhttp.service";
import { DepositDto } from "../../../contract/transaction/DepositTransactionDto";
import { BaseApiResponse } from "../../../contract/helpers/BaseApiResponse";
import { first, firstValueFrom } from "rxjs";
import { GetUserTransactionResponse as GetUserTransactionResponseDto } from "../../../contract/transaction/GetTransactionResponseDto";
import { AssetDto as AssetDto } from "../../../contract/market/actions/AssetDto";
import { CustomPromisifySymbol } from "util";
import { GetUserHoldingsResponseDto as GetUserAssetResponseDto } from "../../../contract/user/common/UserHoldingDto";
import { TransactionDetailsDto } from "../../../contract/transaction/TransactionDetailsDto";

@Injectable({
    providedIn: 'root'
})
export class AssetService {



    constructor(private customHttpClient: CustomHttpClient) { }

    async depositMoney(transactionDto: DepositDto): Promise<BaseApiResponse> {
        try {
            const observable = this.customHttpClient.post<BaseApiResponse, DepositDto>({
                controller: 'holding',
                action: 'CreateDeposit'
            }, transactionDto);
            const res = await firstValueFrom(observable);
            return res;
        } catch (err) {
            throw err;
        }
    }



    async getUserAssets(): Promise<BaseApiResponse<GetUserAssetResponseDto>> {
        try {
            const observable$ = this.customHttpClient.get<BaseApiResponse<GetUserAssetResponseDto>>({
                controller: "holding",
                action: "getUserAssets"
            });
            const res = await firstValueFrom(observable$);
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

    async buyAsset(buyAssetDto: AssetDto): Promise<BaseApiResponse> {
        try {
            const observable$ = this.customHttpClient.post<BaseApiResponse, AssetDto>({
                controller: "transaction",
                action: "BuyAsset",
            }, buyAssetDto);
            const res = await firstValueFrom(observable$);
            return res;
        } catch (err) {
            throw err;
        }
    }

    async selAsset(sellAssetDto: AssetDto): Promise<BaseApiResponse> {
        try {
            const observable$ = await this.customHttpClient.post<BaseApiResponse, AssetDto>({
                controller: "transaction",
                action: "sellAsset"
            }, sellAssetDto);
            const res = await firstValueFrom(observable$);
            return res;
        } catch (err) {
            throw err;
        }
    }

}