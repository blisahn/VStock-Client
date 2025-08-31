import { Routes } from '@angular/router';
import { AuthGuard } from './guards/common/auth.guard';
import { permissionGuard as PermissionGuard } from './guards/common/permission.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./ui/common/components/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./ui/common/components/register/register.component').then(m => m.RegisterComponent) },

    { path: 'market', loadComponent: () => import('./ui/common/components/market/market.component').then(m => m.MarketComponent) },
    {
        path: 'market/details/:symbol',
        loadComponent: () => import('./ui/common/components/market/asset-details/asset-details.component').then(m => m.AssetDetailsComponent)
        , canActivate: [AuthGuard], data: { permissions: ['Profile.View'] }
    },
    { path: 'wallet', loadComponent: () => import('./ui/common/components/wallet/wallet.component').then(m => m.WalletComponent), canActivate: [AuthGuard] },
    {
        path: 'profile',
        loadComponent: () => import('./ui/common/components/profile/layout/profile.layout.component').then(m => m.ProfileLayoutComponent),
        canActivate: [AuthGuard],
        data: { permissions: ['Profile.Edit', 'Profile.View'] },
        children: [
            { path: '', redirectTo: 'profile-general', pathMatch: 'full' },
            { path: 'profile-general', loadComponent: () => import('./ui/common/components/profile/profile-general/profile-general.component').then(m => m.ProfileGeneralComponent) },
            { path: 'account-details', redirectTo: 'profile-details', pathMatch: 'full' },
            { path: 'profile-details', loadComponent: () => import('./ui/common/components/profile/profile-details/profile-details.component').then(m => m.ProfileDetailsComponent) },
            { path: 'profile-orders', loadComponent: () => import('./ui/common/components/profile/profile-orders/profile-orders.component').then(m => m.ProfileOrdersComponent) },
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('./ui/admin/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['Users.View'] },
        children: [
            { path: '', redirectTo: 'admin-settings', pathMatch: 'full' },
            { path: 'admin-settings', loadComponent: () => import('./ui/admin/layout/admin-layout/settings/settings.component').then(m => m.SettingsComponent), data: { permissions: ['Settings.Manage', 'Settings.View'] } }, // <-- canActivate'ı burada tekrarlamaya gerek yok.
            { path: 'admin-users', loadComponent: () => import('./ui/admin/layout/admin-layout/users/list-table/users.list.table.component').then(m => m.UsersTableComponent), data: { permissions: ['Users.View'] } }, // <-- canActivate'ı burada tekrarlamaya gerek yok.
            { path: 'user-details', loadComponent: () => import('./ui/admin/layout/admin-layout/users/list-table/user-details/user-details.component').then(m => m.UserDetailsComponent), data: { permissions: ['Users.Manage'] } },
            { path: 'create-asset', loadComponent: () => import('./ui/admin/layout/admin-layout/settings/create-asset-modal/create-asset-modal.component').then(m => m.CreateAssetModalComponent), data: { permissions: ['Settings.Manage'] } } // <-- canActivate'ı burada tekrarlamaya gerek yok.
        ]
    }
];
