import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendServiceService } from '../../services/backend-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private backendService = inject(BackendServiceService);
  private router = inject(Router);

  username: string = "";
  password: string = "";
  errorMessage: string = "";

  submit(): void {
    this.backendService.loginUser(this.username, this.password).then(
      (response) => {
        this.errorMessage = "";
        this.router.navigate(["/"]);
      },
      (error) => {
        this.errorMessage = error.message;
      }
    )
  }
}
