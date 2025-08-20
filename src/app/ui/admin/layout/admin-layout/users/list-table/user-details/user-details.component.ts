import { Component, inject, Input, OnInit } from '@angular/core';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../../../services/common/custom.toastr.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomDialogService } from '../../../../../../../services/common/custom.dialog.service';
import { UserService } from '../../../../../../../services/models/user/user.service';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../../../../../../services/models/user/user-auth.service';
import { FetchUserDto } from '../../../../../../../contract/user/admin/FetchUserDto';
import { UpdateUserDto } from '../../../../../../../contract/user/admin/UpdateUserDto';
import { AssignRoleDto } from '../../../../../../../contract/user/admin/AssignRoleDto';




@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit {

  @Input() id = '';
  private fb = inject(FormBuilder);
  private toast = inject(CustomToastrService);
  private dialogService = inject(CustomDialogService)
  private userService = inject(UserService)
  private userAuth = inject(UserAuthService)
  isLoading = false;
  isSaving = false;
  private initialValue: FetchUserDto | null = null;
  get formControls() {
    return this.profileForm.controls;
  }
  get rolesCtrl() { return this.profileForm.controls.roles; }
  hasRoleSelected(role: string) { return (this.rolesCtrl.value ?? []).includes(role); }

  availableRoles: Array<'User' | 'Moderator' | 'Admin'> = ['User', 'Moderator', 'Admin'];
  profileForm = this.fb.group({
    id: [''],
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    userName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(32),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/), // ripple/github stili kullanıcı adı
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    roles: this.fb.control<string[]>([]) // çoklu seçim
  });

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    try {
      const userDetails = await this.userService.getUserDetails(this.id!);
      this.initialValue = userDetails.data!;
      this.profileForm.reset(userDetails.data!);
      this.toast.showToastr(userDetails.message, "Basarili", {
        type: ToastrType.Succes,
        position: ToastrPosition.TopRight
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }
  getSelectedRolesCount(): number {
    // Seçili rollerin sayısını döndür
    const currentRoles = this.profileForm.get('roles')?.value || [];
    return currentRoles.length;
  }

  getSelectedRolesText(): string {
    const currentRoles = this.profileForm.get('roles')?.value || [];
    if (currentRoles.length === 0) return '';
    if (currentRoles.length === 1) return currentRoles[0];
    if (currentRoles.length <= 3) return currentRoles.join(', ');
    return `${currentRoles.length} rol seçildi`;
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
    const payload = this.profileForm.getRawValue() as FetchUserDto;
    const messages: string[] = [];

    try {
      if ((payload.roles?.length ?? 0) > 0) {
        const assignRoleDto: AssignRoleDto = {
          id: payload.id!,
          roles: payload.roles!
        };
        const assignRoleResponse = await this.userService.assignRole(assignRoleDto);
        messages.push(assignRoleResponse.message);

        this.rolesCtrl.setValue([]);
        this.rolesCtrl.markAsPristine();
      }

      const profileDirty =
        this.formControls.fullName.dirty ||
        this.formControls.userName.dirty ||
        this.formControls.email.dirty;

      if (profileDirty) {
        var updateUserDto: UpdateUserDto = {
          id: payload.id,
          email: payload.email,
          username: payload.userName,
          fullName: payload.fullName
        };
        const editUserResponse = await this.userService.updateUser(updateUserDto);
        messages.push(editUserResponse.message);
      }

      if (messages.length) {
        this.toast.showToastr(messages.join('\n'), 'Başarılı', {
          position: ToastrPosition.TopRight,
          type: ToastrType.Succes
        });
      }
      this.initialValue = { ...payload, roles: [] };
      this.profileForm.markAsPristine();
    } catch (err) {
      this.userAuth.refreshTokenLogin();
      console.error(err);
    } finally {
      this.isSaving = false;
    }

    this.load();
  }


  onCancel(): void {
    if (this.initialValue) this.profileForm.reset(this.initialValue);
    else this.profileForm.reset();
  }


  onRoleToggle(role: string, checked: boolean) {
    const set = new Set(this.rolesCtrl.value ?? []);
    checked ? set.add(role) : set.delete(role);
    this.rolesCtrl.setValue([...set]);
    this.profileForm.markAsDirty();
  }
}
