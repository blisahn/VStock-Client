import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDetailsComponent } from "../user-details.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [UserDetailsComponent, CommonModule],
  templateUrl: './user-details-modal.component.html',
  styleUrls: ['./user-details-modal.component.css'] // styleUrl → styleUrls
})
export class UserDetailsModalComponent {
  @Input() id = '';
  @Input() open = false;                    // parent kontrol eder
  @Output() openChange = new EventEmitter<boolean>(); // two-way binding için

  close() { this.openChange.emit(false); }
  openNow() { this.openChange.emit(true); }
}
