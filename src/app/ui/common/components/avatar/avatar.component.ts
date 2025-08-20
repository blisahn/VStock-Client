import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomDialogService } from '../../../../services/common/custom.dialog.service';
import { AuthService } from '../../../../services/models/auth.service';
import { UserAuthService } from '../../../../services/models/user/user-auth.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-avatar',
    imports: [CommonModule, RouterLink],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.css'
})
export class AvatarComponent implements OnInit {


  constructor(
    private userAuthService: UserAuthService,
    private dialogService: CustomDialogService,
    public authService: AuthService) {
  }


  ngOnInit(): void {
    this.authService.isAuthenticated();
  }
  async signOut(event: Event) {
    await this.userAuthService.signOut();
  }

  // In your avatar component
  handleSignOut(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Call your dialog service to show confirmation
    this.dialogService.confirmDialog({
      title: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      confirmText: 'Evet, Çık',
      cancelText: 'İptal'
    }).then((confirmed) => {
      if (confirmed) {
        this.signOut(event);
      }
    });
  }


}
