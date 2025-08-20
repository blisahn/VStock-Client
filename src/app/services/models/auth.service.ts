import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  permission?: string[] | string;
  email?: string;
  exp: number;
  [k: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _payload: JwtPayload | null = null;

  constructor() {

    const token = this.accessToken;
    if (token && !this.isTokenExpired(token)) {
      this._payload = jwtDecode<JwtPayload>(token);
    }

  }
  get accessToken(): string | null {

    return sessionStorage!.getItem('accessToken')!;
  }
  get refreshToken(): string | null {

    return sessionStorage!.getItem('refreshToken')!;
  }

  private get roles(): string[] {
    const r = this._payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
  }
  private get permissions(): string[] {
    const p = this._payload?.permission;
    if (!p) return [];
    return Array.isArray(p) ? p : [p];
  }

  setTokens(access: string, refresh: string) {

    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
    this._payload = jwtDecode<JwtPayload>(access); // <<< kritik
  }

  clearTokens() {

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('expiration');
    localStorage.removeItem('refreshTokenExpirationDate');
    this._payload = null; // <<< ekle

  }

  private isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      return !exp || exp * 1000 <= Date.now();
    } catch { return true; }
  }

  isAuthenticated(): boolean {
    const token = this.accessToken;
    return !!token && !this.isTokenExpired(token);
  }

  isRefreshExpired(): boolean {
    const s = localStorage.getItem('refreshTokenExpirationDate');
    if (!s) return true;
    const dt = new Date(s).getTime();
    return isNaN(dt) || dt <= Date.now();
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.hasPermission(p))
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}