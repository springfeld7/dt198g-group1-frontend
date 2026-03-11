import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Event } from '../../models/event';
import { SeatingComponent } from '../seating/seating.component';
import { MatchedPair, MatchingResponseDto, Snapshot } from '../../models/api/matching-response.dto';
import { Table } from '../../models/table';
import { Seat } from '../../models/seat';


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

  eventId!: string;
  event?: Event;
  currentRound: number | null = null;
  roundMatches: Record<number, MatchedPair[]> = {};
  roundSnapshots: Record<number, Snapshot[]> = {};
  tables: Table[] = [];

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.loadEvent();
  }

  /**
   * Loads the event from the backend, stores it in component state,
   * and generates matches for the first round.
   */
  private async loadEvent() {
    try {
      this.event = await this.backendService.getEventById(this.eventId);
      console.log('Loaded event:', this.event);

      this.generateMatches(1);
    } catch (error) {
      console.error('Failed to load event:', error);
      this.messageService.showErrorMessage(
        'Failed to load the event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        5
      );
    }
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

        // Build seating tables with matched participants
        this.buildTablesFromMatches(response.matchedPairs);

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

  /**
   * Converts matched pairs into tables and seats for the seating component.
   */
  private buildTablesFromMatches(matches: MatchedPair[]): void {
    if (!this.event) return;

    const maxSpots = this.event.maxSpots;
    const numTables = Math.ceil(maxSpots / 2);

    this.tables = Array.from({ length: numTables }, (_, i) => {
      const match = matches[i];

      const leftSeat: Seat = { position: 'left', tableNumber: i + 1 };
      const rightSeat: Seat = { position: 'right', tableNumber: i + 1 };

      if (match) {
        // Assign man and woman to seats (can swap if needed)
        leftSeat.userId = match.man;
        leftSeat.userName = `User ${match.man}`; // optionally replace with actual name
        leftSeat.profilePicture = `/resources/img/users/${match.man}.jpg`;

        rightSeat.userId = match.woman;
        rightSeat.userName = `User ${match.woman}`;
        rightSeat.profilePicture = `/resources/img/users/${match.woman}.jpg`;
      }

      return {
        tableNumber: i + 1,
        seats: [leftSeat, rightSeat]
      };
    });
  }
}
