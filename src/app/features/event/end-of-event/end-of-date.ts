import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmModalComponent} from '../../shared/confirm-modal/confirm-modal.component';
import {BackendService} from '../../../services/backend.service';
import {AuthService} from '../../../services/auth.service';
import {MessageService} from '../../../services/message.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-end-of-event',
  imports: [CommonModule, ConfirmModalComponent, FormsModule],
  templateUrl: './end-of-date.html',
  styleUrl: './end-of-date.scss',
})
export class EndOfDate implements OnInit{

  userId: string = '';
  @Input() eventId: string = '';
  previousDates :any = [];
  isModalOpen = false;
  selectedMatchId: string | null = null;

  constructor(
    private backend: BackendService,
    private auth: AuthService,
    private messageService : MessageService,
  ) {}

  /**
   * Initializes the component by fetching the current previous dates
   */
  async ngOnInit() {
    this.userId = this.auth.getUserId();
    const event = await this.backend.getEventById(this.eventId);
    const matches = await this.backend.getMatchesAtEnd(event._id);
    this.previousDates = matches.map(match => ({ ...match, selected: false }));
  }

  /**
   * Toggles the like in the database when the user intend to share personal information.
   * @param matchId the id of the Match object
   */
  toggleLikes(matchId: string) {
    this.messageService.showSuccessMessage("Your requests to share your contact details have been registered." +
      " If the wish is mutual, they will shortly show up under the Matches tab in your profile")
    void this.backend.toggleLike(this.userId, matchId, true)
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
   * Called when clicking the x button.
   * Instead of dismissing immediately, we prepare the modal.
   */
  confirmSelectedMatches() {
    const selectedMatches = this.previousDates.filter((match: { selected: any; }) => match.selected);
    console.log(selectedMatches);
    if (!selectedMatches.length) {
      this.messageService.showWarningMessage("Please select at least one match to confirm.");
      return;
    }

    selectedMatches.forEach((match: { matchId: string; selected: boolean; }) => {
      this.toggleLikes(match.matchId);
      match.selected = false;
    });
    this.isModalOpen = true;
  }

  /**
   * Confirm selection of matches
   */
  onConfirmSelectedMatches() {
    this.isModalOpen = true;
  }

  /**
   * Handles the output from the ConfirmModalComponent
   * @param confirmed the user response
   */
  handleModalResponse(confirmed: boolean) {
    if (confirmed) {
      this.confirmSelectedMatches();
    }
    this.isModalOpen = false;
    this.selectedMatchId = null;
  }
}
