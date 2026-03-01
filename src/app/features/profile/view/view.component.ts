import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BackendService } from '../../../services/backend.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import type { User } from '../../../models/user';

@Component({
  selector: 'app-view',
  imports: [RouterLink, CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {
  private backendService = inject(BackendService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  user: User | null = null;

  ngOnInit() {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.messageService.showErrorMessage('User ID not found', 3);
      return;
    }

    this.backendService.getUserById(userId)
      .then(userData => {
        this.user = userData;
        this.user.img = this.getProfilePicUrl(userId);
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to load profile: ${err.message}`, 5);
      });
  }

  getProfilePicUrl(id: string): string {
    return this.backendService.getUserPictureUrl(id);
  }
}
