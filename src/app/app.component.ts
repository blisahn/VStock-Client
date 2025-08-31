import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/models/auth.service';
import { DialogComponent } from "./ui/common/components/dialog/dialog.component";
import { AvatarComponent } from "./ui/common/components/avatar/avatar.component";
import { UserAuthService } from './services/models/user/user-auth.service';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    DialogComponent,
    AvatarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'VBorsa-Client';
  isAuthenticated: boolean = false;
  constructor(public authService: AuthService, private userAuthService: UserAuthService) {
  }

}
