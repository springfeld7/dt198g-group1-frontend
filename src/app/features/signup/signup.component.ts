import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRegistration } from '../../models/user-registration';
import { CommonModule } from '@angular/common';
import { Interest } from '../../models/interest';
import { BackendService } from '../../services/backend.service';
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
    this.backendService.getAllInterests().then(
      (response) => {
        this.interests = response;
        this.errorMessage = "";
      },
      (error) => {
        this.errorMessage = error.error.error;
      }
    );
  }

  submit(): void {
    this.backendService.registerUser(this.newUser).then(
      (response) => {
        this.errorMessage = "";
        this.backendService.login(response.user.username, this.newUser.password).then(
          (_) => {
            this.router.navigate(["/"]);
          },
          (error) => {
            this.errorMessage = error.error.error;
          }
        )
      },
      (error) => {
        this.errorMessage = error.error.error;
      }
    );
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
