import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRegistration } from '../../models/api/user-registration.dto';
import { CommonModule } from '@angular/common';
import { Interest } from '../../models/interest';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  standalone: true,
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  newUser: UserRegistration = {
    username: "username",
    password: "password",
    repeatPassword: "password",
    firstName: "firstname",
    surname: "surname",
    email: "your@email.com",
    phone: "phone",
    location: "location",
    gender: "woman",
    age: 66,
    interests: [] as string[]
  };
  
  interests: Interest[] = [];
  errorMessage: string = "";
  maxInterests = 5;

  ngOnInit() {
    this.backendService.getAllInterests()
      .then((response) => {
        this.interests = response;
      })
      .catch((err) => {
        this.messageService.showErrorMessage(`Could not load interests: ${err.message}`, 5);
      });
  }

  submit(): void {
    this.messageService.clearMessage();

    this.backendService.registerUser(this.newUser)
      .then((response) => {
        this.backendService.login(response.user.username, this.newUser.password)
          .then(() => {
            this.messageService.showSuccessMessage("Account created successfully! Welcome.", 3);
            this.router.navigate(["/"]);
          })
          .catch((err) => {
            this.messageService.showErrorMessage(`Login failed: ${err.message}`, 5);
          });
      })
      .catch((err) => {
        this.messageService.showErrorMessage(`Registration failed: ${err.message}`, 5);
      });
  }

  onInterestChange(event: Event, id: string): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      if (this.newUser.interests.length < this.maxInterests) {
        if (!this.newUser.interests.includes(id)) {
          this.newUser.interests.push(id);
        }
      } else {
        checkbox.checked = false;
      }
    } else {
      this.newUser.interests = this.newUser.interests.filter((i) => i !== id);
    }
  }
}
