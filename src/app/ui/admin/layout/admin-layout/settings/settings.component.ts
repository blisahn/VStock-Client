import { Component, CSP_NONCE, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import { CustomHttpClient } from '../../../../../services/common/customhttp.service';
import { PagedResult } from '../../../../../contract/helpers/PagedResult';
import { AssetListItemContract } from '../../../../../contract/user/admin/socket/AssetListItemContract';
import { AuthService } from '../../../../../services/models/auth.service';
import { SocketService } from '../../../../../services/models/socket/socket.service';
import { CommonModule } from '@angular/common';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../services/common/custom.toastr.service';
import { CreateAssetModalComponent } from "./create-asset-modal/create-asset-modal.component";

@Component({
    selector: 'app-settings',
    imports: [CommonModule, CreateAssetModalComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

    @ViewChild('assetModal') assetModal!: CreateAssetModalComponent;
    assetType = "CRYPTO";
    assets: PagedResult<AssetListItemContract> = { items: [], totalCount: 0, page: 1, pageSize: 5 };
    totalAssetsCount: number = 0;
    canManageAssets: boolean = false;
    isLoading: boolean = true;
    constructor(
        private socketService: SocketService,
        private customHttpService: CustomHttpClient,
        private authService: AuthService,
        private toastrService: CustomToastrService
    ) { }
    async ngOnInit(): Promise<void> {
        this.canManageAssets = this.authService.hasPermission("Settings.Manage");
        if (this.canManageAssets)
            await this.getAssets();
        else
            this.toastrService.showToastr("Sayfayi goruntuleyecek yetkiniz bulunmamaktadir", "Erisim engeli", {
                type: ToastrType.Warning,
                position: ToastrPosition.TopRight
            });
    }
    async getAssets() {
        try {
            const res = await this.socketService.getSpecifiedAssets(this.assetType);
            this.assets = res.data ?? { items: [], totalCount: 0, page: 1, pageSize: 5 };
            this.totalAssetsCount = this.assets.totalCount;
        } finally {
            this.isLoading = false;
        }
    }

    trackByAssetId(index: number, asset: AssetListItemContract | undefined) {
        return asset?.code ?? index;
    }


    async toggleAssetVisibility(asset: AssetListItemContract, $event: Event) {
        asset.isActive = !asset.isActive;
        asset.isVisibleForNonLogin = asset.isVisibleForNonLogin

        try {
            const res = await this.socketService.updateAssetVisibility(asset.symbolId, asset.isVisibleForNonLogin, asset.isActive);
            this.toastrService.showToastr(res.message, "Başarılı", {
                type: ToastrType.Succes,
                position: ToastrPosition.TopRight
            });
        } catch (err) {
            console.log(err);
            debugger;
            asset.isActive = !asset.isActive;
            this.toastrService.showToastr("Güncelleme sırasında bir hata oluştu!", "Hata", {
                type: ToastrType.Error,
                position: ToastrPosition.TopRight
            });
        }
    }
    async toggleAssetVisibilityForNonLogins(asset: AssetListItemContract, $event: Event) {
        asset.isVisibleForNonLogin = !asset.isVisibleForNonLogin;
        asset.isActive = asset.isActive
        try {
            const res = await this.socketService.updateAssetVisibilityForNonLogin(asset.symbolId, asset.isVisibleForNonLogin, asset.isActive);
            this.toastrService.showToastr(res.message, "Başarılı", {
                type: ToastrType.Succes,
                position: ToastrPosition.TopRight
            });
        } catch (err) {
            debugger;
            asset.isVisibleForNonLogin = !asset.isVisibleForNonLogin;
            this.toastrService.showToastr("Güncelleme sırasında bir hata oluştu!", "Hata", {
                type: ToastrType.Error,
                position: ToastrPosition.TopRight
            });
        }
    }


    createAsset() {
        this.assetModal!.openAssetModal();
    }
    onAssetCreated($event: Event) {
        this.getAssets();
    }

}
