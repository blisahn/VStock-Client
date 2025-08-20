
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../services/common/custom.toastr.service';
import { CustomDialogService } from '../../../../../services/common/custom.dialog.service';
import { UserService } from '../../../../../services/models/user/user.service';
import { UserAuthService } from '../../../../../services/models/user/user-auth.service';
import { UpdateProfileDto } from '../../../../../contract/user/common/UpdateProfileDto';


@Component({
    selector: 'app-profile-settings',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile-details.component.html'
})
export class ProfileDetailsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private toast = inject(CustomToastrService);
  private dialogService = inject(CustomDialogService)
  private userService = inject(UserService)
  private userAuth = inject(UserAuthService)
  isLoading = false;
  isSaving = false;

  private initialValue: UpdateProfileDto | null = null;

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(32),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/), // ripple/github stili kullanıcı adı
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    try {
      const profileDetails = await this.userService.getProfileDetails();
      this.initialValue = profileDetails.data!;
      this.profileForm.reset(profileDetails.data!);
      this.toast.showToastr(profileDetails.message!, "Basarili", {
        type: ToastrType.Succes,
        position: ToastrPosition.TopRight
      }
      )
    } catch (err: any) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  async ask() {
    const res = await this.dialogService.confirmDialog({
      title: "Onay gerekmektedir",
      message: "Guncellemek istediginize emin misniz?",
      cancelText: "Hayir, vazgectim.",
      confirmText: "Evet, guncelle."
    });
    if (res) {
      this.onSubmit();
    } else {
      this.profileForm.reset(this.profileForm.getRawValue());
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const payload = this.profileForm.getRawValue() as UpdateProfileDto;
    try {
      const updateProfileResponse = await this.userService.updateProfile(payload);
      this.toast.showToastr(updateProfileResponse.message!, 'Başarılı', { type: ToastrType.Succes, position: ToastrPosition.BottomRight });
      this.initialValue = payload;
      this.profileForm.markAsPristine();
    } catch (err: any) {
      this.userAuth.refreshTokenLogin();
      console.error(err)
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    if (this.initialValue) this.profileForm.reset(this.initialValue);
    else this.profileForm.reset();
  }

  get f() {
    return this.profileForm.controls;
  }
}
