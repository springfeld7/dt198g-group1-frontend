import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { Interest } from '../../models/interest';
import { BackendServiceService } from '../../services/backend-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  standalone: true,
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private backendService = inject(BackendServiceService);
  private router = inject(Router);

  newUser = {
    username: "username",
    password: "password",
    repeatPassword: "password",
    firstName: "firstname",
    surname: "surname",
    email: "email@email.email",
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
        if (error instanceof Error) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = "An unknown error occured";
        }
      }
    );
  }

  submit(): void {
    this.backendService.registerUser(this.newUser).then(
      (response) => {
        this.errorMessage = "";
        this.backendService.loginUser(response.user.username, this.newUser.password).then(
          (userData) => {
            this.router.navigate(["/"]);
          },
          (error) => {
            this.errorMessage = "Invalid credentials.";
          }
        )
      },
      (error) => {
        if (error instanceof Error) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = "An unknown error occured.";
        }
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
