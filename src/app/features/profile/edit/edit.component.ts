import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackendService } from '../../../services/backend.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import type { User } from '../../../models/user';
import type { Interest } from '../../../models/interest';

@Component({
  selector: 'app-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  private backendService = inject(BackendService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  user: User | null = null;
  allInterests: Interest[] = [];
  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      age: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      password: [''],
      retypePassword: [''],
      interest1: ['', Validators.required],
      interest2: ['', Validators.required],
      interest3: ['', Validators.required],
      interest4: ['', Validators.required],
      interest5: ['', Validators.required]
    });
  }

  ngOnInit() {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.messageService.showErrorMessage('User ID not found', 3);
      this.router.navigate(['/login']);
      return;
    }

    this.backendService.getUserById(userId)
      .then(userData => {
        this.user = userData;
        this.user.img = this.backendService.getUserPictureUrl(userId);
        
        this.profileForm.patchValue({
          firstName: userData.firstName || '',
          surname: userData.surname || '',
          username: userData.username || '',
          age: userData.age || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || ''
        });

        if (userData.interests && userData.interests.length > 0) {
          userData.interests.forEach((interest, index) => {
            if (index < 5) {
              this.profileForm.patchValue({
                [`interest${index + 1}`]: interest._id
              });
            }
          });
        }
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to load profile: ${err.message}`, 5);
      });

    this.backendService.getAllInterests()
      .then(interests => {
        this.allInterests = interests;
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to load interests: ${err.message}`, 5);
      });
  }

  onChangeImage() {
    this.messageService.showSuccessMessage('Button pressed', 1);
  }

  onSubmit() {
    if (!this.profileForm.valid) {
      this.messageService.showErrorMessage('Please fill in all required fields correctly', 3);
      return;
    }

    const formValue = this.profileForm.value;

    if (formValue.password !== formValue.retypePassword) {
      this.messageService.showErrorMessage('Passwords do not match', 3);
      return;
    }

    const currentPassword = window.prompt('Enter your current password to confirm:');

    if (currentPassword === null) {
      return;
    }

    if (!currentPassword) {
      this.messageService.showErrorMessage('Password is required to save', 3);
      return;
    }

    const selectedInterests = [
      formValue.interest1,
      formValue.interest2,
      formValue.interest3,
      formValue.interest4,
      formValue.interest5
    ].filter(interest => interest !== '');

    const updateData = {
      firstName: formValue.firstName,
      surname: formValue.surname,
      username: formValue.username,
      age: formValue.age,
      email: formValue.email,
      phone: formValue.phone,
      location: formValue.location,
      interests: selectedInterests,
      password: formValue.password || currentPassword,
      repeatPassword: formValue.password || currentPassword
    };

    this.backendService.updateUser(updateData)
      .then(() => {
        this.messageService.showSuccessMessage('Profile updated successfully!', 3);
        this.router.navigate(['/profile']);
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to update profile: ${err.message}`, 5);
      });
  }
}