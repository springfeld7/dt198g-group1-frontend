import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { BackendService } from '../../../services/backend.service';
import { MessageService } from '../../../services/message.service';
import { Event as EventModel } from '../../../models/event';
import { Table } from '../../../models/table';
import { SeatingComponent } from '../../seating/seating.component';
import { EndOfDate } from '../end-of-event/end-of-date';
import { NextDateResponseDto } from '../../../models/api/nextdate-response.dto';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-user-event',
  imports: [CommonModule, SeatingComponent, EndOfDate, FormsModule],
  templateUrl: './user-event.component.html',
  styleUrls: ['./user-event.component.scss'],
})
export class UserEventComponent {

  private authService = inject(AuthService);
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  eventId!: string;
  event?: EventModel;
  tables: Table[] = [];
  currentRound = 1; // 1,2,3 -> after 3rd round triggers end-of-event
  nextDate?: NextDateResponseDto;
  questions: Question[] = [];
  answers: Record<string, any> = {};
  isWaiting = true; // true when polling for next date
  isFormOpen = false; // controls the review form modal
  dateCountdownEndTimestamp?: number;
  dateEndCountdownEndTimestamp?: number;
  dateCountdown = 0; // seconds until date starts
  dateEndCountdown = 0; // seconds for date duration countdown
  reviewCountdown = 120; // seconds for autosubmit timer
  reviewInterval?: any;

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    this.eventId = eventId!;

    await this.loadEvent(this.eventId);
    this.currentRound = this.event?.currentRound || 1;
    this.questions = await this.backendService.getAllQuestions();

    this.pollNextDate();
  }


  /**
   * Loads the event from the backend and updates the component state.
   */
  private loadEvent(eventId: string): Promise<void> {
    return this.backendService.getEventById(eventId)
      .then(event => {
        this.event = event;
        console.log('Fetched event:', event);
        this.messageService.showSuccessMessage('You are now checked in, welcome!', 3);
      })
      .catch(error => {
        console.error('Error fetching event:', error);
        this.messageService.showErrorMessage('Failed to fetch event.', 5);
      });
  }

  /**
   * Polls the backend for the next date assignment. If a next date is assigned,
   * it updates the component state with the new date information and starts the countdowns.
   * It continues polling until a next date is assigned or after 3 rounds when the event ends.
   */
  private pollNextDate(): void {
    if (this.currentRound > 3) return; // stop polling after last round

    this.isWaiting = true;

    const poll = async () => {
      try {
        const next = await this.backendService.getNextDate(this.eventId, this.currentRound);

        // Only proceed if the next date object is valid
        if (next && next.tableNumber && next.seat && next.user && next.user._id) {
          this.nextDate = next;
          this.isWaiting = false;

          // Build tables and mark your seat
          this.buildTablesWithMySeat({ tableNumber: next.tableNumber, seat: next.seat });

          // Start countdown for the date
          this.startDateCountdown(next.startTime);
        }
      } catch (err) {
        console.error('Polling error:', err);
        this.messageService.showErrorMessage('Error while waiting for next date. Retrying...', 5);
      }
    };

    poll(); // initial attempt

    // Repeat polling every 5 seconds if nextDate not yet ready
    const pollInterval = setInterval(() => {
      if (!this.nextDate || !this.nextDate.tableNumber) poll();
      else clearInterval(pollInterval);
    }, 5000);
  }

  private startDateCountdown(startTime: Date) {
    const startMs = new Date(startTime).getTime();

    // 1-minute countdown until official start
    this.dateCountdownEndTimestamp = startMs + 60_000;

    // total end of date is startTime + 6 minutes (1 min pre + 5 min actual date)
    this.dateEndCountdownEndTimestamp = startMs + 6 * 60_000;

    this.updateDateCountdown();
    this.updateDateEndCountdown(); // immediately update

    const countdownSub = interval(1000).subscribe(() => {
      this.updateDateCountdown();
      this.updateDateEndCountdown();

      // When 1-min countdown ends, it just stops, but 5-min countdown continues
      if (this.dateCountdown <= 0) {
        this.dateCountdownEndTimestamp = undefined;
      }

      // When 6-min total ends, open review form
      if (this.dateEndCountdown <= 0) {
        countdownSub.unsubscribe();
        this.openReviewForm();
      }
    });
  }

  /**
   * Updates the countdown for the next date.
   * When the countdown reaches zero, it starts the date end countdown.
   */
  private updateDateCountdown() {
    if (!this.dateCountdownEndTimestamp) {
      this.dateCountdown = 0;
      return;
    }
    const now = Date.now();
    this.dateCountdown = Math.max(0, Math.floor((this.dateCountdownEndTimestamp - now) / 1000));
  }

  /**
   * Updates the countdown for the end of the date.
   * When the countdown reaches zero, it opens the review form modal.
   */
  private updateDateEndCountdown() {
    if (!this.dateEndCountdownEndTimestamp) {
      this.dateEndCountdown = 0;
      return;
    }
    const now = Date.now();
    this.dateEndCountdown = Math.max(0, Math.floor((this.dateEndCountdownEndTimestamp - now) / 1000));
  }

  /**
   * Gets a formatted countdown string in MM:SS format for display in the UI.
   * @param seconds The number of seconds remaining in the countdown.
   * @returns The formatted countdown string.
   */
  getFormattedCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m.toString();
    const ss = s < 10 ? '0' + s : s.toString();
    return `${mm}:${ss}`;
  }

  /**
   * Opens the review form modal and starts the autosubmit timer.
   * If the user does not submit within 2 minutes, the form will be automatically
   * submitted with whatever answers they have provided.
   */
  private openReviewForm(): void {
    this.isFormOpen = true;
    this.answers = {};

    this.reviewCountdown = 120;
    const formInterval = interval(1000).subscribe(() => {
      if (this.reviewCountdown > 0) {
        this.reviewCountdown--;
      } else {
        formInterval.unsubscribe();
        this.submitReview();
      }
    });
  }

  /**
   * Submits the review form answers to the backend.
   */
  submitReview() {
    if (!this.nextDate) return;

    this.backendService.createReview(
      this.eventId,
      this.currentRound,
      this.nextDate.user._id,
      this.answers
    )
      .then(() => {
        this.isFormOpen = false;
        this.nextDate = undefined;
        this.currentRound++;

        // If rounds left, restart polling
        if (this.currentRound <= 3) {
          this.pollNextDate();
        }
      })
      .catch((error) => {
        console.error('Failed to submit review:', error);
        this.messageService.showErrorMessage('Failed to submit review. Please try again.', 5);
      });
  }

  /**
   * Builds empty tables and marks the seat assigned to the current user based on the match object.
   * @param match - Object containing your tableNumber and seat position ('left' | 'right')
   */
  private buildTablesWithMySeat(match: { tableNumber: number; seat: 'left' | 'right' }): void {
    if (!this.event) return;

    // Build empty tables
    const numTables = Math.ceil(this.event.maxSpots / 2);
    this.tables = Array.from({ length: numTables }, (_, i) => ({
      tableNumber: i + 1,
      seats: [
        { position: 'left', tableNumber: i + 1 },
        { position: 'right', tableNumber: i + 1 }
      ]
    }));

    // Mark current user's seat
    const table = this.tables.find(t => t.tableNumber === match.tableNumber);
    if (!table) return;

    const mySeat = table.seats.find(s => s.position === match.seat);
    if (!mySeat) return;

    mySeat.userId = this.authService.getUserId(); // highlight this seat in the UI
  }

  /**
   * Returns a comma-separated string of the next date's interests for display in the UI.
   */
  get nextDateInterests(): string {
    return this.nextDate?.user?.interests?.map(i => i.name).join(', ') || '';
  }

  get reviewCountdownDisplay(): string {
    const m = Math.floor(this.reviewCountdown / 60);
    const s = this.reviewCountdown % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
 * Fetches the profile picture URL for a given user ID.
 *
 * @param id userId of the profile picture to fetch.
 * @returns the URL of the user's profile picture.
 */
  getProfilePicUrl(id: string): string {
    return this.backendService.getUserPictureUrl(id);
  }

  /**
   * Sets a default profile picture if the original fails to load.
   * @param event The DOM event triggered by the <img> load error.
   */
  handleImageError(event: any) {
    event.target.src = '/profile-placeholder.svg';
  }
}
