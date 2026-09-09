import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() portalTitle: string = 'AML Compliance Portal';

  authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
