import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: 'logout.component.html',
})
export class LogoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}