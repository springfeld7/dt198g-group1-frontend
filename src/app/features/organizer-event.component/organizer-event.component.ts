import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Event as EventModel } from '../../models/event';
import { SeatingComponent } from '../seating/seating.component';
import { MatchedPair, MatchingResponseDto, Snapshot } from '../../models/api/matching-response.dto';
import { Table } from '../../models/table';
import { Seat } from '../../models/seat';
import { User } from '../../models/user';


@Component({
  selector: 'app-organizer-event',
  imports: [CommonModule, SeatingComponent],
  templateUrl: './organizer-event.component.html',
  styleUrls: ['./organizer-event.component.scss']
})
export class OrganizerEventComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  eventId!: string;
  event?: EventModel;
  currentRound: number | null = null;
  roundMatches: Record<number, MatchedPair[]> = {};
  roundSnapshots: Record<number, Snapshot[]> = {};
  tables: Table[] = [];

  swapMode = false; // false = normal mode, true = swap mode
  selectedMen: Seat[] = []; // selected men for swapping
  selectedWomen: Seat[] = [];

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
    console.log('Building tables from matches:', matches);
    const maxSpots = this.event.maxSpots;
    const numTables = Math.ceil(maxSpots / 2);

    this.tables = Array.from({ length: numTables }, (_, i) => {
      const match = matches[i];

      const leftSeat: Seat = { position: 'left', tableNumber: i + 1 };
      const rightSeat: Seat = { position: 'right', tableNumber: i + 1 };

      if (match) {

        // Find full User objects in the event
        const manUser = this.event?.registeredMen.find(
          (u): u is User => typeof u !== 'string' && u._id === match.man
        );
        const womanUser = this.event?.registeredWomen.find(
          (u): u is User => typeof u !== 'string' && u._id === match.woman
        );

        // Assign man and woman to seats
        leftSeat.userId = match.man;
        leftSeat.userName = `User ${match.man}`;
        leftSeat.profilePicture = `/resources/img/users/${match.man}.jpg`;
        leftSeat.user = manUser;

        rightSeat.userId = match.woman;
        rightSeat.userName = `User ${match.woman}`;
        rightSeat.profilePicture = `/resources/img/users/${match.woman}.jpg`;
        rightSeat.user = womanUser;
      }

      return {
        tableNumber: i + 1,
        seats: [leftSeat, rightSeat]
      };
    });
  }

  /** Builds empty tables based on event.maxSpots */
  private buildEmptyTables() {
    if (!this.event) return;

    const maxSpots = this.event.maxSpots;
    const numTables = Math.ceil(maxSpots / 2);

    this.tables = Array.from({ length: numTables }, (_, i) => {
      const leftSeat: Seat = { position: 'left', tableNumber: i + 1 };
      const rightSeat: Seat = { position: 'right', tableNumber: i + 1 };

      return {
        tableNumber: i + 1,
        seats: [leftSeat, rightSeat]
      };
    });
  }

  /**
   * Switches the current round and updates the seating arrangement
   * based on the matches of the selected round.
   * @param round The round number to switch to (1, 2, or 3)
   */
  switchRound(round: number) {
    this.currentRound = round;

    const matches = this.roundMatches[round];

    if (matches && matches.length > 0) {
      // build tables from matches
      this.buildTablesFromMatches(matches);
    } else {
      // no matches yet, create empty tables
      this.buildEmptyTables();
    }
  }
  /**
   * Toggles swap mode on or off. When swap mode is on, the organizer
   * can select a pair of men or a pair of women and swap their seats.
   */
  toggleSwapMode() {
    this.swapMode = !this.swapMode;
    this.selectedMen = [];
    this.selectedWomen = [];
  }

  /**
   * Handle seat click in swap mode.
   * Only allows two men OR two women selected at a time.
   */
  onSeatSelectedForSwap(seat: Seat) {
    if (!this.swapMode || !seat.userId) return;

    const isMan = seat.position === 'left';
    const isWoman = seat.position === 'right';

    if (isMan) {
      if (this.selectedWomen.length) this.selectedWomen = [];
      const index = this.selectedMen.indexOf(seat);
      if (index >= 0) this.selectedMen.splice(index, 1);
      else {
        if (this.selectedMen.length >= 2) this.selectedMen.shift();
        this.selectedMen.push(seat);
      }
    } else if (isWoman) {
      if (this.selectedMen.length) this.selectedMen = [];
      const index = this.selectedWomen.indexOf(seat);
      if (index >= 0) this.selectedWomen.splice(index, 1);
      else {
        if (this.selectedWomen.length >= 2) this.selectedWomen.shift();
        this.selectedWomen.push(seat);
      }
    }
  }

  /**
   * Checks if a seat is currently selected for swapping
   */
  isSelectedForSwap(seat: Seat): boolean {
    return this.selectedMen.includes(seat) || this.selectedWomen.includes(seat);
  }


  /**
   * Swaps the currently selected seats of the same gender
   */
  swapSelectedSeats() {
    if (this.selectedMen.length === 2) {
      const [a, b] = this.selectedMen;
      [a.user, b.user] = [b.user, a.user];
      [a.userId, b.userId] = [b.userId, a.userId];
      [a.userName, b.userName] = [b.userName, a.userName];
      this.selectedMen = [];
    }
    if (this.selectedWomen.length === 2) {
      const [a, b] = this.selectedWomen;
      [a.user, b.user] = [b.user, a.user];
      [a.userId, b.userId] = [b.userId, a.userId];
      [a.userName, b.userName] = [b.userName, a.userName];
      this.selectedWomen = [];
    }
  }

  /**
   * Ends swap mode and clears all selections
   */
  saveSwapChanges() {
    this.swapMode = false;
    this.selectedMen = [];
    this.selectedWomen = [];
    this.messageService.showSuccessMessage('Swap changes applied!', 3);
  }

  /**
   * Finalizes the matches for the current round,
   * and stores the finalized matches in the backend.
   */
  finalizeMatches() {

  }
}
