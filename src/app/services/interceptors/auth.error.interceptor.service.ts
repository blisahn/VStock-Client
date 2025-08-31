import { HttpHandlerFn, HttpInterceptorFn, HttpStatusCode, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../models/auth.service';
import { UserAuthService } from '../models/user/user-auth.service';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

let refreshInProgress = false;
let refreshSubject = new Subject<string | null>();

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {


    const auth = inject(AuthService);
    const userAuth = inject(UserAuthService);
    const token = auth.accessToken;
    const isAuthCall = isAuthEndpoint(req.url);

    if (!isAuthCall && !auth.isAuthenticated() && !auth.isRefreshExpired()) {
        return performRefreshAndRetry(req, next, userAuth, auth);
    }


    const authReq = (!isAuthCall && token)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((err) => {
            const is401 = err.status === HttpStatusCode.Unauthorized;
            const is403 = err.status === HttpStatusCode.Forbidden;

            if (isAuthCall) return throwError(() => err);
            if (is401) {
                if (auth.isRefreshExpired()) {
                    userAuth.signOut();
                    return throwError(() => err);
                }
                return performRefreshAndRetry(authReq, next, userAuth, auth);
            }

            if (is403) {
                userAuth.signOut();
                return throwError(() => err);
            }
            return throwError(() => err);
        })
    );
};


function refreshToken(userAuth: UserAuthService, auth: AuthService): Observable<string> {
    return new Observable<string>((observer) => {
        userAuth.refreshTokenLogin().then(ok => {
            const newToken = auth.accessToken;
            if (ok && auth.accessToken) {
                observer.next(newToken!);
                observer.complete();
            } else observer.error('refresh_failed');
        }).catch(() => observer.error('refresh_failed'));
    });
}

function isAuthEndpoint(url: string): boolean {
    try {
        const u = new URL(url, location.origin);
        return u.pathname.startsWith('/api/auth/')
    } catch {
        const lower = url.toLowerCase();
        return lower.includes('/auth/login') || lower.includes('/auth/refreshtokenlogin');
    }
}

function performRefreshAndRetry(req: HttpRequest<any>, next: HttpHandlerFn,
    userAuth: UserAuthService, auth: AuthService): Observable<any> {
    if (!refreshInProgress) {
        refreshInProgress = true;
        refreshSubject = new Subject<string | null>();
        return refreshToken(userAuth, auth).pipe(
            switchMap((newToken) => {
                refreshInProgress = false;
                refreshSubject.next(newToken);
                refreshSubject.complete();

                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                return next(retryReq);
            }),
            catchError((e) => {
                refreshInProgress = false;
                refreshSubject.error(e);
                refreshSubject.complete();   // tamamla ki bekleyenler takılmasın
                userAuth.signOut();
                return throwError(() => e);
            })
        );
    } else {
        return refreshSubject.pipe(
            take(1),
            switchMap((newToken) => {
                const retryReq = newToken
                    ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                    : req; // yine de gönder, error handler yakalar
                return next(retryReq);
            })
        );
    }
}

