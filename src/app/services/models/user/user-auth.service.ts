import { Injectable } from '@angular/core';
import { CustomHttpClient } from '../../common/customhttp.service';
import { firstValueFrom } from 'rxjs';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../common/custom.toastr.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LoginUserResponseDto } from '../../../contract/user/common/LoginUserResponseDto';
import { LoginUserDto } from '../../../contract/user/common/LoginUserDto';
import { BaseApiResponse } from '../../../contract/helpers/BaseApiResponse';
import { Token } from '../../../contract/token/Token';
import { SignalRService } from '../../signalR/signal-r.service';
import { CryptoQuote } from '../../../contract/market/common/CryptoQuote';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  constructor(
    private http: CustomHttpClient,
    private toastr: CustomToastrService,
    private auth: AuthService,
    private router: Router,
    private signalRService: SignalRService
  ) { }
  async login(loginUserRequest: LoginUserDto): Promise<BaseApiResponse<Token>> {
    try {
      const request$ = this.http.post<LoginUserResponseDto, LoginUserDto>(
        { controller: 'auth', action: 'login' },
        loginUserRequest
      );
      const res = await firstValueFrom(request$) as unknown as BaseApiResponse<Token>;

      if (res.succeeded && res.data?.accessToken) {
        const t = res.data;
        sessionStorage.setItem('accessToken', t.accessToken);
        sessionStorage.setItem('refreshToken', t.refreshToken);
        localStorage.setItem('expiration', t.expiration.toString());
        localStorage.setItem('refreshTokenExpirationDate', t.refreshTokenExpiresAtUtc.toString());
      }
      return res;
    } catch (err) {
      throw err;
    }
  }

  async refreshTokenLogin(): Promise<BaseApiResponse<Token>> {
    const rt = this.auth.refreshToken;
    try {
      const request$ = this.http.post<BaseApiResponse<Token>>({
        controller: "auth",
        action: "refreshTokenLogin"
      }, { refreshToken: rt })
      let res = await firstValueFrom(request$);
      sessionStorage.setItem('accessToken', res!.data!.accessToken!);
      sessionStorage.setItem('refreshToken', res!.data!.refreshToken!);
      if (res!.data!.expiration) localStorage.setItem('expiration', res!.data!.expiration.toString());
      if (res!.data!.refreshTokenExpiresAtUtc) localStorage.setItem('refreshTokenExpirationDate', res!.data!.refreshTokenExpiresAtUtc.toString());
      return res;
    } catch (err) {
      throw (err);
    }
  }

  async signOut() {
    this.auth.clearTokens();
    this.signalRService.stopConnection();
    await this.router.navigate(['/login']);
    this.toastr.showToastr('Oturumunuz kapatıldı', 'Bilgi', { type: ToastrType.Info, position: ToastrPosition.BottomRight });
  }
}