import { Component } from '@angular/core';
import { RegisterComponent } from "../register.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'register-modal',
    imports: [RegisterComponent, CommonModule],
    templateUrl: './register-modal.component.html',
    styleUrl: './register-modal.component.css'
})
export class ModalComponent {
  showRegister: boolean = false;

  openRegisterModal() {
    this.showRegister = true;
  }

  closeRegisterModal() {
    this.showRegister = false;
  }

  onModalToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.showRegister = checkbox.checked;
  }
}