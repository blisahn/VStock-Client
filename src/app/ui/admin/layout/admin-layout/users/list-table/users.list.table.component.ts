import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../../services/models/user/user.service';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../../../services/common/custom.toastr.service';
import { CustomDialogService } from '../../../../../../services/common/custom.dialog.service';
import { AuthService } from '../../../../../../services/models/auth.service';
import { UserDetailsModalComponent } from "./user-details/user-details-modal/user-details-modal.component";
import { ReactiveFormsModule } from '@angular/forms';
import { PagedResult } from '../../../../../../contract/helpers/PagedResult';
import { UserListItemContract } from '../../../../../../contract/user/admin/user/UserListItemContract';

@Component({
  selector: 'app-admin-users-list',
  imports: [CommonModule, UserDetailsModalComponent, ReactiveFormsModule],
  templateUrl: './users.list.table.component.html',
  styleUrl: './users.list.table.component.css'
})
export class UsersTableComponent implements OnInit {

  showUserDetailModal: boolean = false;
  selectedUserId: string = '';


  constructor(
    private userService: UserService,
    private toastr: CustomToastrService,
    private dialogServce: CustomDialogService,
    private authService: AuthService
  ) { }

  users?: PagedResult<UserListItemContract>;
  totalUserCount: number = 0;
  canManageUsers: boolean = false;

  async ngOnInit() {
    this.canManageUsers = this.authService.hasPermission('Users.Manage');
    const res = await this.userService.getAllUsers();
    this.users = res.data ?? { items: [], totalCount: 0, page: 1, pageSize: 5 };
    this.totalUserCount = this.users!.totalCount
  }

  async copyId(id: string | undefined) {
    if (!id) return;
    await navigator.clipboard.writeText(id);
    this.toastr.showToastr("ID başarıyla kopyalandı.", "Başarılı", {
      type: ToastrType.Succes,
      position: ToastrPosition.BottomCenter
    });
  }

  async deleteUser(userId: string) {
    var res = await this.dialogServce.confirmDialog({
      message: "Kullaniciyi silmek istediginize emin misiniz?",
      title: "Dikkat!",
      cancelText: "Hayir",
      confirmText: "Evet"
    });
    if (res) {
      try {
        await this.userService.deleteUser(userId);
        if (this.authService.isAuthenticated()) {
          this.toastr.showToastr("Kullanici silindi", "Bilgilendirme", {
            type: ToastrType.Warning,
            position: ToastrPosition.BottomRight
          });
        }
      } catch (err: any) {
        console.error(err)
      }
    }
    this.ngOnInit();
  }

  openUpdateUserModal(id: string) {
    this.selectedUserId = id;
    this.showUserDetailModal = true;
  }

}
