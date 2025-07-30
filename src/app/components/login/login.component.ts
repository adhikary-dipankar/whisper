import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isRegister: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMessage = '';
  }

  submit() {
    if (this.isRegister) {
      this.authService.register(this.username, this.password).subscribe({
        next: () => {
          this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
              this.authService.saveToken(response.token);
              this.router.navigate(['/chat']);
            },
            error: () => this.errorMessage = 'Login after registration failed'
          });
        },
        error: () => this.errorMessage = 'Registration failed'
      });
    } else {
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          this.router.navigate(['/chat']);
        },
        error: () => this.errorMessage = 'Login failed'
      });
    }
  }
}