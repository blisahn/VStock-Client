import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpClient {
  baseUrl: string = 'http://localhost:5217/api';

  constructor(private httpClient: HttpClient) {
    inject(HttpClient);
  }

  private url(requestParameters: Partial<RequestParameters>): string {
    const parts = [
      requestParameters.baseUrl || this.baseUrl,
      requestParameters.controller,
      requestParameters.action
    ].filter(Boolean);
    return parts.map(p => p?.trim().replace(/^\/+|\/+$/g, '')).join('/');
  }



  public get<ResponseType>(requestParameters: Partial<RequestParameters>, parameter?: string): Observable<ResponseType> {

    let url = '';
    if (requestParameters.fullEndpoint)
      url = requestParameters.fullEndpoint;
    else
      url = `${this.url(requestParameters)}${parameter ? `/${parameter}` : ''}${requestParameters.queryString ? requestParameters.queryString : ''}`;
    return this.httpClient.get<ResponseType>(url, {
      headers: requestParameters.headers,
      responseType: requestParameters.responseType as 'json'
    });
  }
  public delete<ResponseType>(requestParameter: Partial<RequestParameters>, parameter?: string): Observable<ResponseType> {
    let url = '';
    if (requestParameter.fullEndpoint)
      url = requestParameter.fullEndpoint;
    else
      url = `${this.url(requestParameter)}${parameter ? `/${parameter}` : ''}${requestParameter.queryString ? requestParameter.queryString : ''}`;
    return this.httpClient.delete<ResponseType>(url, {
      headers: requestParameter.headers,
      responseType: requestParameter.responseType as 'json'
    });
  }

  post<ResponseType, TBody = unknown>(requestParameter: Partial<RequestParameters>, body: TBody): Observable<ResponseType> {
    let url = '';
    if (requestParameter.fullEndpoint)
      url = requestParameter.fullEndpoint;
    else
      url = `${this.url(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ''}`;
    return this.httpClient.post<ResponseType>(url, body, {
      headers: requestParameter.headers,
      responseType: requestParameter.responseType as 'json'
    });

  }

  public put<ResponseType, TBody = unknown>(requestParameter: Partial<RequestParameters>, body: TBody): Observable<ResponseType> {

    let url = '';
    if (requestParameter.fullEndpoint)
      url = requestParameter.fullEndpoint;
    else
      url = `${this.url(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ''}`;

    return this.httpClient.put<ResponseType>(url, body, {
      headers: requestParameter.headers,
      responseType: requestParameter.responseType as 'json'
    });
  }


}
export class RequestParameters {
  controller?: string;
  action?: string;
  queryString?: string;

  headers?: HttpHeaders;
  baseUrl?: string;
  fullEndpoint?: string;
  responseType?: string = 'json';
}
