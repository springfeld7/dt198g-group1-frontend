import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Event as EventModel } from '../../models/event';
import { User } from '../../models/user';
import { BackendService } from '../../services/backend.service';
import { EventReviewsResponse } from '../../models/api/getreview-response.dto';
import { Review } from '../../models/review';

@Component({
  selector: 'app-organizer-event-profile',
  imports: [CommonModule],
  templateUrl: './organizer-event-profile.html',
  styleUrl: './organizer-event-profile.scss',
})
export class OrganizerEventProfileComponent {
  @Input() event?: EventModel;
  @Input() user?: User;
  reviews: EventReviewsResponse | null = null;
  isOpen = false;

  backendService = inject(BackendService);

  firstThreeQuestions = [
    { id: '6992ef88cd605d760113e407', text: 'Happy with date?', type: 'boolean' },
    { id: '6992f0edcd605d760113e40c', text: 'Broaden horizons?', type: 'boolean' },
    { id: '6992f118cd605d760113e40e', text: 'Age pref for next date?', type: 'multipleChoice', options: ['Younger', 'Older', 'Same Age or close'] }
  ];

  receivedReviews: Review[] = [];
  givenReviews: Review[] = [];

  /**
   * Opens the profile modal for a specific user and event.
   */
  async open(user: User, event: EventModel) {
    this.user = user;
    this.event = event;
    this.isOpen = true;

    if (event?._id) {
      try {
        await this.getEventReviews(event._id, user._id!);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        this.reviews = null;
      }
    }
  }

  /**
   * Closes the profile modal and clears the user and event data.
   */
  close() {
    this.isOpen = false;
    this.user = undefined;
    this.event = undefined;
    this.reviews = null;
  }

  /**
   * Returns the profile picture URL for a given user ID.
   * @param userId - The user ID (non-nullable)
   */
  getProfilePicUrl(userId: string | undefined): string {
    if (!userId) return '/assets/default-profile.jpg';
    return this.backendService.getUserPictureUrl(userId);
  }

  /**
 * Retrieve all reviews for the current user within a specific event.
 * 
 * @param eventId - The unique identifier of the event whose reviews should be fetched.
 * @returns A promise resolving to an {@link EventReviewsResponse} object containing
 * the reviews for each round of the event. Each round may contain an array of reviews
 * or `null` if no reviews exist for that round.
 */
  getEventReviews(eventId: string, userId: string) {
    this.backendService.getEventReviews(eventId, userId).then((res) => {
      // Flatten all rounds
      const allReviews = [
        ...(res.firstRound || []),
        ...(res.secondRound || []),
        ...(res.thirdRound || []),
      ];
      this.reviews = res;

      // Separate received vs given
      this.receivedReviews = allReviews.filter(r => r.dateId === userId);
      this.givenReviews = allReviews.filter(r => r.reviewer === userId);
      for (const review of this.givenReviews) {
        console.log('Given review:', review);
      }
      for (const review of this.receivedReviews) {
        console.log('Received review:', review);  
      }

    });
  }

  mapAnswer(q: { id: string; type: string; options?: string[] }, review: Review): string {
    const raw = review.answers[q.id];
    if (raw === undefined) return '-';

    if (q.type === 'boolean') return raw === true ? 'Yes' : 'No';
    if (q.type === 'multipleChoice' && q.options) {
      const index = Number(raw); // convert "0"/"1"/"2" to number
      return q.options[index] ?? '-';
    }

    return String(raw);
  }
}
