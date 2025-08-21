import { Injectable } from "@angular/core";
import { CustomHttpClient } from "../../common/customhttp.service";
import { BaseApiResponse } from "../../../contract/helpers/BaseApiResponse";
import { firstValueFrom } from "rxjs";
import { GraphQuote } from "../../../contract/market/common/GraphQuote";

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    constructor(private customHttpClient: CustomHttpClient,
    ) { }

    async getHistoricalKlines(symbol: string,
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
                action: "getcryptodata",
                queryString: queryString
            });
            const res = await firstValueFrom(request$);
            return res;
        } catch (err) {
            throw err;
        }
    }

}