import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { MessageService } from '../../services/message.service';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';
import { SharedContact } from '../../models/shared-contact';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss'
})
export class MatchesComponent implements OnInit {

  private backend = inject(BackendService);
  private auth = inject(AuthService);
  private messageService = inject(MessageService);

  matches: SharedContact[] = [];
  userId: string = '';
  isModalOpen = false;
  selectedMatch: SharedContact | null = null;

  /**
   * Initializes the component by fetching the current user's matches.
   */
  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.loadMatches();
  }

  /**
   * Fetches the user's matches from the backend.
   * Utilizes MessageService for user-facing error feedback.
   */
  loadMatches() {
    this.backend.getUserSharedContacts(this.userId)
      .then(data => {
        this.matches = data;
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to load matches: ${err.message}`, 5);
        console.error("Match load error:", err);
      });
  }

  /**
   * Called when clicking the trash icon.
   * Instead of deleting immediately, we prepare the modal.
   */
  onRemoveSharedContact(match: SharedContact) {
    this.selectedMatch = match;
    this.isModalOpen = true;
  }

  /**
   * Handles the output from the ConfirmModalComponent
   */
  handleModalResponse(confirmed: boolean) {
    if (confirmed && this.selectedMatch) {
      this.executeDelete(this.selectedMatch._id);
    }

    // Always close and reset
    this.isModalOpen = false;
    this.selectedMatch = null;
  }

  /**
   * Executes the deletion of a match after confirmation.
   * 
   * @param matchId the ID of the match to delete.
   */
  private executeDelete(matchId: string) {
    this.backend.removeSharedContact(matchId)
      .then(() => {
        this.matches = this.matches.filter(m => m._id !== matchId);
        this.messageService.showSuccessMessage("Shared contact removed.", 3);
      })
      .catch(err => {
        this.messageService.showErrorMessage(`Failed to remove shared contact: ${err.message}`, 5);
      });
  }

  /**
   * Fetches the profile picture URL for a given user ID.
   * 
   * @param id userId of the profile picture to fetch.
   * @returns the URL of the user's profile picture.
   */
  getProfilePicUrl(id: string): string {
    return this.backend.getUserPictureUrl(id);
  }

  /**
   * Sets a default profile picture if the original fails to load.
   * @param event The DOM event triggered by the <img> load error.
   */
  handleImageError(event: any) {
    event.target.src = '/profile-placeholder.svg';
  }

  /**
   * Checks if a match is new and unviewed by the user.
   * @param id the ID of the match to check.
   * @returns whether the match with the given ID is new and unviewed by the user.
   */
  isNewSharedContact(match: SharedContact): boolean {
    
    return false;
  }
}
