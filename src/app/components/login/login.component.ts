import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isRegister: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
  }

  submit() {
    if (this.isRegister) {
      this.authService.register(this.username, this.password).subscribe(() => {
        this.authService.login(this.username, this.password).subscribe(response => {
          this.authService.saveToken(response.token);
          this.router.navigate(['/chat']);
        });
      });
    } else {
      this.authService.login(this.username, this.password).subscribe(response => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/chat']);
      });
    }
  }
}