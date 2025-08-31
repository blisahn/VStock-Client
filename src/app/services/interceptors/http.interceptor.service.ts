import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CustomToastrService, ToastrPosition, ToastrType } from '../common/custom.toastr.service';
import { catchError, throwError } from 'rxjs';

export const httpErrorHandlerInterceptorFn: HttpInterceptorFn = (req, next) => {
    const toastrService = inject(CustomToastrService);

    return next(req).pipe(
        catchError((error: any) => {
            // backend’in döndürdüğü şema: error.message ya da error.error.error.message
            const message =
                error?.error?.error?.message ??
                error?.error?.message ??
                error.message ?? 'Bilinmeyen hata';
            const title =
                error?.error?.error?.title ??
                error?.error?.title ??
                error.title ?? 'Bilinmeyen hata basligi';
            switch (error.status) {
                case 400:
                case 403:
                case 404:
                case 422:
                case 500:
                default:
                    toastrService.showToastr(message, title, { type: ToastrType.Warning, position: ToastrPosition.TopRight });
                    break;
            }
            return throwError(() => error); // <-- önemli
        })
    );

};
