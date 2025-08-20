import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
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

    if (!isAuthCall) {
        const accessExpired = !auth.isAuthenticated();
        const refreshOk = !auth.isRefreshExpired();

        if (accessExpired && refreshOk) {
            return performRefreshAndRetry(req, next, userAuth, auth);
        }
    }


    const authReq = !isAuthCall && token
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
                return throwError(() => err);
            }
            return throwError(() => err);
        })
    );
};


function refreshToken(userAuth: UserAuthService, auth: AuthService): Observable<string> {
    return new Observable<string>((observer) => {
        userAuth.refreshTokenLogin().then(ok => {
            if (ok && auth.accessToken) {
                observer.next(auth.accessToken);
                observer.complete();
            } else observer.error('refresh_failed');
        }).catch(() => observer.error('refresh_failed'));
    });
}

function isAuthEndpoint(url: string): boolean {
    const u = url.toLowerCase();
    return u.includes('/auth/login') || u.includes('/auth/refreshtokenlogin');
}
function performRefreshAndRetry(req: any, next: any, userAuth: UserAuthService, auth: AuthService): Observable<any> {
    if (!refreshInProgress) {
        refreshInProgress = true;
        refreshSubject = new Subject<string | null>(); // YENİ subject

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
                // Kullanıcıyı çıkart
                // userAuth.signOut();
                return throwError(() => e);
            })
        );
    } else {
        // Devam eden refresh'i bekle
        return refreshSubject.pipe(
            take(1),
            switchMap((newToken) => {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                return next(retryReq);
            })
        );
    }
}

