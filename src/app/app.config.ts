import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { httpErrorHandlerInterceptorFn } from './services/interceptors/http.interceptor.service';
import { authInterceptorFn } from './services/interceptors/auth.error.interceptor.service';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    // provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideToastr(),

    provideHttpClient(
      withInterceptors([
        httpErrorHandlerInterceptorFn,
        authInterceptorFn
      ])
    ),
  ]
};
