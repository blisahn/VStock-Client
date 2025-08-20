import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet], // <-- ÖNEMLİ
  templateUrl: './profile.layout.component.html',
  styleUrl: './profile.layout.component.css'
})
export class ProfileLayoutComponent {

}
