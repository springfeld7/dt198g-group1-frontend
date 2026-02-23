import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  username: string = "";
  password: string = "";

  /**
   * Handles the login form submission.
   */
  async submit(): Promise<void> {
    try {
      //this.messageService.clearMessage();
      await this.authService.login(this.username, this.password);
      this.router.navigate(["/"]);

    } catch (err: any) {
      this.messageService.showErrorMessage(err.message, 5);
    }
  }
}
