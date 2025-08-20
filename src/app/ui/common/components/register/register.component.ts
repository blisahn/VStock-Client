import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { CreateUserDto } from '../../../../contract/user/common/CreateUserDto';
import { CustomToastrService, ToastrPosition, ToastrType } from '../../../../services/common/custom.toastr.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/models/user/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: UntypedFormGroup

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private toastrService: CustomToastrService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required],
      fullName: ['', Validators.required]
    });
  }



  async register(user: CreateUserDto) {
    debugger;
    if (this.registerForm.invalid) {
      this.toastrService.showToastr("Lutfen formu istendigi sekilde doldurunuz", 'Hata', {
        type: ToastrType.Error,
        position: ToastrPosition.TopRight
      });
      return;
    }

    try {
      const result = await this.userService.create(user);
      this.toastrService.showToastr(result.message, "Basarili", {
        type: ToastrType.Succes,
        position: ToastrPosition.TopRight
      });
    } catch (error: any) {
      console.error(error)

    }

  }
}
