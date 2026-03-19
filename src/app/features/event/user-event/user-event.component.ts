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
  shouldOpenForm = false; // whether to open form after date ends (false if review already exists)
  dateCountdownEndTimestamp?: number;
  dateEndCountdownEndTimestamp?: number;
  dateCountdown = 0; // seconds until date starts
  dateEndCountdown = 0; // seconds for date duration countdown
  reviewCountdown = 120; // seconds for autosubmit timer
  reviewInterval?: any;
  private startupDuration = 5_000; // 1 minute for seat finding
  private dateDuration = 5_000; // 5 minutes for actual date
  private reviewDuration = 90_000; // 90 seconds for autosubmit

  private pollIntervalId?: any;
  private countdownSub?: Subscription;
  private reviewSub?: Subscription;

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
   * Clears the polling interval and any active subscriptions
   * when the component is destroyed to prevent memory leaks and unintended behavior.
   */
  ngOnDestroy(): void {
    this.clearPolling();
    this.countdownSub?.unsubscribe();
    this.reviewSub?.unsubscribe();
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
    this.clearPolling(); // Clear any existing polling intervals before starting a new one
    if (this.currentRound > 3) return; // stop polling after last round

    this.isWaiting = true;

    const poll = async () => {

      if (this.currentRound > 3) { // Guard clause to stop polling if event ended while waiting
        this.clearPolling();
        return;
      }

      try {
        const next = await this.backendService.getNextDate(this.eventId, this.currentRound);

        if (!next || !next.tableNumber || !next.seat || !next.user?._id) {
          // No date assigned yet → keep waiting
          this.isWaiting = true;
          return;
        }

        if (next.review) {
          // Date completed + review exists → move to next round and poll again
          this.shouldOpenForm = false;
          this.isWaiting = true;
          this.currentRound++;

          // Check if all rounds are done
          if (this.currentRound > 3) {
            this.isWaiting = false;
            console.log('All rounds completed. Event ended.');
            this.clearPolling();
            return;
          }

          this.nextDate = undefined;
          this.clearPolling();
          this.pollNextDate(); // immediately start polling for next date
        } else {
          // Date assigned and in progress → show it
          this.nextDate = next;
          this.shouldOpenForm = true;
          this.isWaiting = false;

          // Build tables and mark your seat
          this.buildTablesWithMySeat({ tableNumber: next.tableNumber, seat: next.seat });

          // Start countdown for this date
          this.startDateCountdown(next.startTime);
        }
      } catch (err) {
        console.error('Polling error:', err);
        this.messageService.showErrorMessage('Error while waiting for next date. Retrying...', 5);
      }
    };

    poll(); // initial attempt

    // Repeat polling every 5 seconds if nextDate not yet ready
    this.pollIntervalId = setInterval(() => {
      if (!this.nextDate || !this.nextDate.tableNumber) {
        poll();
      } else {
        this.clearPolling();
      }
    }, 5000);
  }

  /**
   * Clears the polling interval to stop further requests to the backend for the next date.
   */
  private clearPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = undefined;
    }
  }

  private startDateCountdown(startTime: Date) {
    const startMs = new Date(startTime).getTime();

    // 1-minute countdown until official start
    this.dateCountdownEndTimestamp = startMs + this.startupDuration;

    // total end of date is startTime + 6 minutes (1 min pre + 5 min actual date)
    this.dateEndCountdownEndTimestamp = startMs + this.startupDuration + this.dateDuration;

    this.updateDateCountdown();
    this.updateDateEndCountdown(); // immediately update

    this.countdownSub = interval(1000).subscribe(() => {
      this.updateDateCountdown();
      this.updateDateEndCountdown();

      // When 1-min countdown ends, it just stops, but 5-min countdown continues
      if (this.dateCountdown <= 0) {
        this.dateCountdownEndTimestamp = undefined;
      }

      // When 6-min total ends, open review form
      if (this.dateEndCountdown <= 0) {
        this.countdownSub?.unsubscribe();
        // Only open form if the user hasn't reviewed yet
        if (this.shouldOpenForm) {
          this.openReviewForm();
        }
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

    // Calculate remaining time based on startTime + startup + date duration
    const startMs = new Date(this.nextDate!.startTime).getTime();
    const reviewEndTime = startMs + this.startupDuration + this.dateDuration + this.reviewDuration;
    const now = Date.now();
    this.reviewCountdown = Math.max(0, Math.floor((reviewEndTime - now) / 1000));

    this.reviewSub = interval(1000).subscribe(() => {
      if (this.reviewCountdown > 0) {
        this.reviewCountdown--;
      } else {
        this.reviewSub?.unsubscribe();
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
        this.shouldOpenForm = false; // reset for next poll
        this.currentRound++;
        // If rounds left, restart polling
        if (this.currentRound <= 3) {
          console.log('Review submitted. Moving to next round:', this.currentRound);
          this.clearPolling();
          this.pollNextDate();
        } else {
          console.log('All rounds completed. Event ended.');
          this.clearPolling();
          this.isWaiting = false;
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

  /**
   * Gets a formatted countdown string for the review autosubmit timer in MM:SS format for display in the UI.
   */
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
