import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Event } from '../../models/event';
import { SeatingComponent } from '../seating/seating.component';
import { MatchedPair, MatchingResponseDto, Snapshot } from '../../models/api/matching-response.dto';

@Component({
  selector: 'app-organizer-event',
  imports: [SeatingComponent],
  templateUrl: './organizer-event.component.html',
  styleUrls: ['./organizer-event.component.scss']
})
export class OrganizerEventComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  private eventId!: string;
  private event?: Event;
  private currentRound: number | null = null;
  private roundMatches: Record<number, MatchedPair[]> = {};
  private roundSnapshots: Record<number, Snapshot[]> = {};

  /**
   * Loads the event from the backend when the component initializes,
   * then generates matches for the first round.
   */
  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    try {
      this.event = await this.backendService.getEventById(this.eventId);
      console.log('Loaded event:', this.event);

    } catch (error) {
      console.error('Failed to load event:', error);

      this.messageService.showErrorMessage(
        'Failed to load the event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        5
      );
    }

    this.generateMatches(1);
  }

  /**
   * Generates matches for a specific round, stores results in component state,
   * and shows success or error messages.
   *
   * @param {number} round - The round number for which to generate matches (1, 2, 3)
   */
  private generateMatches(round: number): void {
    this.backendService.generateMatches(this.eventId, round)
      .then((response: MatchingResponseDto) => {
        console.log(`Matches generated for round ${round}:`, response);

        // Store matches and snapshots
        this.roundMatches[round] = response.matchedPairs;
        this.roundSnapshots[round] = response.snapshots;
        this.currentRound = round;

        this.messageService.showSuccessMessage(
          `Matches for round ${round} generated successfully!`,
          5
        );
      })
      .catch(error => {
        this.messageService.showErrorMessage(
          `Failed to generate matches for round ${round}: ` +
          (error instanceof Error ? error.message : 'Unknown error'),
          5
        );
      });
  }
}
