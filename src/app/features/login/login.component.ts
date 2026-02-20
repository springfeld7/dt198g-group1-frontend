import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = "";
  password: string = "";
  errorMessage: string = "";

  submit(): void {
    this.authService.login(this.username, this.password).then(
      (_) => {
        this.errorMessage = "";
        this.router.navigate(["/"]);
      },
      (error) => {
        this.errorMessage = error.error.error;
      }
    )
  }
}
