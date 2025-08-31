import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { CustomHttpClient } from '../../../../../../services/common/customhttp.service';
import { SocketService } from '../../../../../../services/models/socket/socket.service';
import { CreateAssetContract } from '../../../../../../contract/user/admin/socket/CreateAssetContract';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../../services/common/custom.toastr.service';
import { Toast } from 'ngx-toastr';

@Component({
  selector: 'app-create-asset-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-asset-modal.component.html',
  styleUrl: './create-asset-modal.component.css'
})
export class CreateAssetModalComponent {
  @Output() assetCreated = new EventEmitter<any>();
  showAssetModal: boolean = false;
  assetForm!: UntypedFormGroup;

  constructor(private formBuilder: FormBuilder, private socketService: SocketService, private toastrService: CustomToastrService) {
    this.assetForm = this.formBuilder.group({
      source: ['', Validators.required],
      code: ['', Validators.required],
      assetClass: ['', Validators.required],
      isActive: [true],
      isVisibleForNonLogin: [true],
    });
  }
  openAssetModal() {
    this.showAssetModal = true;
  }

  closeAssetModal() {
    this.showAssetModal = false;
  }

  onModalToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.showAssetModal = checkbox.checked;
  }
  async createAsset(assetToCreate: CreateAssetContract) {
    const res = await this.socketService.createAssetAsync(assetToCreate);
    if (res.succeeded) {
      this.toastrService.showToastr(res.message, "Kayit Basarili", {
        position: ToastrPosition.TopRight,
        type: ToastrType.Succes
      });
      this.assetCreated.emit(assetToCreate);
    }
  }

}