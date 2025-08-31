import { Injectable } from "@angular/core";
import { CustomHttpClient } from "../../common/customhttp.service";
import { BaseApiResponse } from "../../../contract/helpers/BaseApiResponse";
import { firstValueFrom } from "rxjs";
import { GraphQuote } from "../../../contract/market/common/crypto/GraphQuote";
import { GetALlAssetsResponseDto } from "../../../contract/user/admin/socket/GetAllAssetsResponseDto";
import { CreateAssetContract } from "../../../contract/user/admin/socket/CreateAssetContract";

@Injectable({
    providedIn: 'root'
})
export class SocketService {

    constructor(private customHttpClient: CustomHttpClient,
    ) { }

    async getHistoricalCrpytoKlines(symbol: string,
        interval: string,
        startTime: number,
        endTime: number,
        limit: number): Promise<BaseApiResponse<GraphQuote[][]>> {
        let queryString = `?symbol=${symbol}&interval=${interval}`;

        if (startTime && startTime > 0) {
            queryString += `&startTime=${startTime}`;
        }
        if (endTime && endTime > 0) {
            queryString += `&endTime=${endTime}`;
        }
        if (limit && limit > 0) {
            queryString += `&limit=${limit}`;
        }

        try {
            const request$ = this.customHttpClient.get<BaseApiResponse<GraphQuote[][]>>({
                controller: "socket",
                action: "getcryptoklinedata",
                queryString: queryString
            });
            const res = await firstValueFrom(request$);
            return res;
        } catch (err) {
            throw err;
        }
    }
    async createAssetAsync(assetToCreate: CreateAssetContract): Promise<BaseApiResponse> {
        try {
            const observable$ = await this.customHttpClient.post<BaseApiResponse, CreateAssetContract>({
                controller: "socket",
                action: "createassetsymbol"
            }, assetToCreate);
            const res = await firstValueFrom(observable$);
            return res;
        } catch (err) {
            throw (err);
        }
    }

    async getSpecifiedAssets(assettClass: string): Promise<BaseApiResponse<GetALlAssetsResponseDto>> {
        let queryString = `?AssetClass=${assettClass}`;
        const request$ = this.customHttpClient.get<BaseApiResponse<GetALlAssetsResponseDto>>({
            controller: "socket",
            action: "GetAssetSymbols",
            queryString: queryString
        });
        const res = await firstValueFrom(request$);
        return res;

    }

    async updateAssetVisibility(symbolId: string, IsVisibleForNonLogin: boolean, isActive: boolean) {
        try {
            const observable$ = this.customHttpClient.put<BaseApiResponse>({
                controller: "socket",
                action: "UpdateAssetVisibility"
            }, { id: symbolId, IsVisibleForNonLogin, isActive })
            const res = await firstValueFrom(observable$);
            return res;
        } catch (err) {
            throw err;
        }
    }

    async updateAssetVisibilityForNonLogin(symbolId: string, IsVisibleForNonLogin: boolean, isActive: boolean) {
        try {
            const observable$ = this.customHttpClient.put<BaseApiResponse>({
                controller: "socket",
                action: "UpdateAssetVisibility"
            }, { id: symbolId, IsVisibleForNonLogin, isActive })
            const res = await firstValueFrom(observable$);
            return res;
        } catch (err) {
            throw err;
        }
    }



}