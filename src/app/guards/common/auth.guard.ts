import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { CustomToastrService, ToastrPosition, ToastrType } from "../../services/common/custom.toastr.service";
import { AuthService } from "../../services/models/auth.service";
import { UserAuthService } from "../../services/models/user/user-auth.service";



export const AuthGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toastr = inject(CustomToastrService);
    const userAuthService = inject(UserAuthService);

    if (auth.isAuthenticated()) {
        return true;
    }
    if (!auth.isRefreshExpired()) {
        userAuthService.refreshTokenLogin();
        return true;
    }
    // Refresh de olmadıysa login'e at
    toastr.showToastr('Oturum acmaniz gerekiyor', 'Oturum acin.', { type: ToastrType.Warning, position: ToastrPosition.TopRight });
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}
