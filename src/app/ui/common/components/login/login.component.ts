import { Component } from '@angular/core';
import { ModalComponent } from "../register/register-modal/register-modal.component";
import { UserAuthService } from '../../../../services/models/user/user-auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginUserDto } from '../../../../contract/user/common/LoginUserDto';
import { CommonModule } from '@angular/common';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../services/common/custom.toastr.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ModalComponent,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginUserDto: LoginUserDto = { usernameOrEmail: '', password: '' };
  constructor(
    private userAuthService: UserAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: CustomToastrService
  ) { }

  async login() {
    const loginResponse = await this.userAuthService.login(this.loginUserDto);
    if (loginResponse.succeeded!) {
      const returnUrl = this.getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
      if (returnUrl != null) {
        this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      }
      this.toastr.showToastr(loginResponse.message!, "Basarili", {
        position: ToastrPosition.TopRight,
        type: ToastrType.Succes
      });
    }
    console.log("Giris basarisiz");
  }

  getSafeReturnUrl(url: string | null): string {
    if (!url) return '/';
    return url;
  }

}
