import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Event as EventModel } from '../../models/event';
import { SeatingComponent } from '../seating/seating.component';
import { MatchingVisualizationComponent } from '../event/matching-visualization/matching-visualization.component';
import { MatchedPair, MatchingResponseDto, Snapshot } from '../../models/api/matching-response.dto';
import { Table } from '../../models/table';
import { Seat } from '../../models/seat';
import { User } from '../../models/user';
import { Match } from '../../models/match';
import { Review } from '../../models/review';


@Component({
  selector: 'app-organizer-event',
  imports: [CommonModule, SeatingComponent, MatchingVisualizationComponent],
  templateUrl: './organizer-event.component.html',
  styleUrls: ['./organizer-event.component.scss']
})
export class OrganizerEventComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  eventId!: string;
  event?: EventModel;
  currentRound: number = 0;
  viewedRound: number = 1;
  roundMatches: Record<number, MatchedPair[]> = {};
  roundSnapshots: Record<number, Snapshot[]> = {};
  roundTables: Record<number, Table[]> = {};

  swapMode = false; // false = normal mode, true = swap mode
  swapTables: Table[] = [];
  selectedMen: Seat[] = []; // selected men for swapping
  selectedWomen: Seat[] = [];

  showVisualization = false;

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.loadEvent();
    console.log("Current round:", this.currentRound);
    console.log("Viewed round:", this.viewedRound);
  }

  /**
   * Loads the event from the backend, stores it in component state,
   * and generates matches for the first round.
   */
  private async loadEvent() {
    try {
      this.event = await this.backendService.getEventById(this.eventId);
      console.log('Loaded event:', this.event);

      // Initialize roundMatches & roundTables from pre-populated Match objects
      this.initializeRounds();

      this.currentRound = this.event.currentRound || 0;
      this.viewedRound = 1; // default to viewing round 1 when event loads

      // Fallback if backend value is incorrect or missing
      const derivedRound = this.deriveCurrentRoundFromMatches();
      if (derivedRound > this.currentRound) {
        this.currentRound = derivedRound;
      }

      // 2. Only auto-generate if we are at the very start (no rounds started yet)
      // AND no matches exist for Round 1
      const round1MatchesExist = this.roundMatches[1] && this.roundMatches[1].length > 0;

      if (this.currentRound === 0 && !round1MatchesExist) {
        console.log("Auto-generating Round 1 matches...");
        this.generateMatchesForViewedRound(); // Using the manual method helper
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      this.messageService.showErrorMessage(
        'Failed to load the event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        5
      );
    }
  }

  /**
   * Initializes the matches and tables for all rounds based on the event data,
   * including feedback for all rounds where applicable.
   */
  private initializeRounds(): void {
    if (!this.event) return;

    for (let r = 1; r <= 3; r++) {
      let currentPairs: Match[] = [];
      if (r === 1) currentPairs = this.event.pairsFirstRound || [];
      else if (r === 2) currentPairs = this.event.pairsSecondRound || [];
      else if (r === 3) currentPairs = this.event.pairsThirdRound || [];

      if (currentPairs && currentPairs.length > 0) {
        // Store IDs for logic
        this.roundMatches[r] = currentPairs.map(m => ({
          man: typeof m.man === 'string' ? m.man : m.man._id,
          woman: typeof m.woman === 'string' ? m.woman : m.woman._id
        }));

        // Feedback comes from the source data of the PREVIOUS round
        let previousPairs: Match[] = [];
        if (r === 2) previousPairs = this.event.pairsFirstRound || [];
        else if (r === 3) previousPairs = this.event.pairsSecondRound || [];

        this.roundTables[r] = this.buildTablesFromMatches(
          this.roundMatches[r],
          r,
          previousPairs
        );
      } else {
        // Just build empty tables if no matches exist for this round yet
        this.buildEmptyTablesForRound(r);
      }
    }
  }

  /**
   * Manual trigger to generate matches for the viewed round
   */
  public generateMatchesForViewedRound(): void {
    const round = this.viewedRound;
    if (!round) return;

    this.backendService.generateMatches(this.eventId, round)
      .then((response: MatchingResponseDto) => {
        this.roundMatches[round] = response.matchedPairs;
        this.roundSnapshots[round] = response.snapshots;

        // Fetch feedback source
        let previousPairs: Match[] = [];
        // if (round === 2) previousPairs = this.event?.pairsFirstRound || [];
        // else if (round === 3) previousPairs = this.event?.pairsSecondRound || [];

        if (round === 2) {
          previousPairs = this.event?.pairsFirstRound || [];
          console.log("DEBUG [Gen]: pairsFirstRound found:", previousPairs);
        } else if (round === 3) {
          previousPairs = this.event?.pairsSecondRound || [];
          console.log("DEBUG [Gen]: pairsSecondRound found:", previousPairs);
        }

        this.roundTables[round] = this.buildTablesFromMatches(
          response.matchedPairs,
          round,
          previousPairs
        );

        this.messageService.showSuccessMessage(`Matches for round ${round} generated!`, 3);
      })
      .catch(error => {
        this.messageService.showErrorMessage(`Generation failed: ${error.message}`, 5);
      });
  }

  /**
 * Derives the current round based on which roundMatches exist.
 * This is used as a fallback when loading the event.
 */
  private deriveCurrentRoundFromMatches(): number {
    if (this.roundMatches[3]?.length) return 3;
    if (this.roundMatches[2]?.length) return 2;
    if (this.roundMatches[1]?.length) return 1;
    return 0;
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
        this.roundMatches[round] = response.matchedPairs;
        this.roundSnapshots[round] = response.snapshots;
        this.currentRound = round;

        // ---- Build previousRoundMatches for feedback ----
        let previousRoundMatches: Match[] = [];
        if (round === 2) {
          previousRoundMatches = this.roundTables[1].map(table => ({
            man: table.seats[0].userId!,
            woman: table.seats[1].userId!,
            reviews:
              this.event!.pairsFirstRound.find(
                m => m.man === table.seats[0].userId && m.woman === table.seats[1].userId
              )?.reviews || [],
            tableNumber: table.tableNumber,
            manSeat: 'left',
            womanSeat: 'right',
          }));
        } else if (round === 3) {
          previousRoundMatches = this.roundTables[2].map(table => ({
            man: table.seats[0].userId!,
            woman: table.seats[1].userId!,
            reviews:
              this.event!.pairsSecondRound.find(
                m => m.man === table.seats[0].userId && m.woman === table.seats[1].userId
              )?.reviews || [],
            tableNumber: table.tableNumber,
            manSeat: 'left',
            womanSeat: 'right',
          }));
        }

        // ---- Build tables for this round, including feedback ----
        this.roundTables[round] = this.buildTablesFromMatches(
          response.matchedPairs,
          round,
          previousRoundMatches
        );

        this.messageService.showSuccessMessage(
          `Matches for round ${round} generated successfully!`,
          5
        );
      })
      .catch(error => {
        this.messageService.showErrorMessage(
          `Failed to generate matches for round ${round}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          15
        );
      });
  }

  private buildTablesFromMatches(
    matches: MatchedPair[],
    round: number,
    previousRoundMatches: Match[] = []
  ): Table[] {
    if (!this.event) return [];

    const FEEDBACK_QID = '6992f230cd605d760113e40f';
    const numTables = Math.ceil(this.event.maxSpots / 2);

    // Collect all reviews from previous round into a single array for easier lookup
    const allPreviousReviews: Review[] = previousRoundMatches
      .flatMap(m => m.reviews || [])
      .filter((r): r is Review => typeof r !== 'string');

    return Array.from({ length: numTables }, (_, i) => {
      const match = matches[i];
      const leftSeat: Seat = { position: 'left', tableNumber: i + 1 };
      const rightSeat: Seat = { position: 'right', tableNumber: i + 1 };

      if (!match) return { tableNumber: i + 1, seats: [leftSeat, rightSeat] };

      const manUser = this.getUserById(match.man);
      const womanUser = this.getUserById(match.woman);

      leftSeat.userId = match.man;
      leftSeat.userName = manUser ? `${manUser.firstName} ${manUser.surname}` : `User ${match.man}`;
      leftSeat.user = manUser;

      rightSeat.userId = match.woman;
      rightSeat.userName = womanUser ? `${womanUser.firstName} ${womanUser.surname}` : `User ${match.woman}`;
      rightSeat.user = womanUser;

      // ===== FEEDBACK EXTRACTION =====
      if (round > 1 && allPreviousReviews.length > 0) {
        // Check if the current MAN left a review in the previous round
        const manReview = allPreviousReviews.find(r => String(r.reviewer) === String(match.man));
        if (manReview?.answers?.[FEEDBACK_QID]) {
          leftSeat.feedback = manReview.answers[FEEDBACK_QID] as string;
          leftSeat.hasFeedback = true;
        }

        // Check if the current WOMAN left a review in the previous round
        const womanReview = allPreviousReviews.find(r => String(r.reviewer) === String(match.woman));
        if (womanReview?.answers?.[FEEDBACK_QID]) {
          rightSeat.feedback = womanReview.answers[FEEDBACK_QID] as string;
          rightSeat.hasFeedback = true;
        }
      }

      return { tableNumber: i + 1, seats: [leftSeat, rightSeat] };
    });
  }


  /**
   * Getter for the tables of the current round.
   */
  get tablesForCurrentRound(): Table[] {
    return this.roundTables[this.viewedRound!] || [];
  }

  /**
   * Builds empty tables for the current round based on event.maxSpots
   * and stores them in roundTables.
   */
  private buildEmptyTablesForRound(round: number): void {
    if (!this.event) return;

    const maxSpots = this.event.maxSpots;
    const numTables = Math.ceil(maxSpots / 2);

    this.roundTables[round] = Array.from({ length: numTables }, (_, i) => {
      const leftSeat: Seat = { position: 'left', tableNumber: i + 1 };
      const rightSeat: Seat = { position: 'right', tableNumber: i + 1 };

      return { tableNumber: i + 1, seats: [leftSeat, rightSeat] };
    });
  }

  /**
 * Finalizes the matches for the current round,
 * and stores the finalized matches in the backend.
 */
  finalizeMatches() {
    if (!this.event) return;

    const matches: Match[] = this.tablesForCurrentRound.map(table => {
      const left = table.seats.find(s => s.position === 'left')!;
      const right = table.seats.find(s => s.position === 'right')!;

      return {
        man: left.userId!,        // assume left is man
        woman: right.userId!,      // assume right is woman
        tableNumber: table.tableNumber,
        manSeat: 'left',
        womanSeat: 'right',
      };
    });
    const round = this.viewedRound;
    console.log(`Finalizing matches for round ${round}:`, matches);

    this.backendService
      .saveRoundMatches(this.eventId, round, matches)
      .then(async updatedEvent => {
        this.event = updatedEvent;
        console.log("Updated event current round:", updatedEvent.currentRound);
        this.currentRound = updatedEvent.currentRound!; // update current round if backend changed it
        console.log(updatedEvent);
        this.messageService.showSuccessMessage(
          `Matches for round ${this.currentRound} finalized successfully!`,
          3
        );
      })
      .catch(error => {
        this.messageService.showErrorMessage(
          `Failed to finalize matches: ${error instanceof Error ? error.message : 'Unknown error'}`,
          5
        );
      });
  }

  /**
   * Gets a user by their ID from the event.
   * @param id The id to search for.
   * @returns the User object if found, otherwise undefined.
   */
  private getUserById(id: string): User {
    if (!this.event) throw new Error('Event not loaded');

    const man = this.event.registeredMen.find((u): u is User => typeof u !== 'string' && u._id === id);
    const woman = this.event.registeredWomen.find((u): u is User => typeof u !== 'string' && u._id === id);

    if (man) return man;
    if (woman) return woman;

    throw new Error(`User with id ${id} not found`);
  }

  /**
   * Switches the current round and updates the seating arrangement
   * based on the matches of the selected round.
   * @param round The round number to switch to (1, 2, or 3)
   */
  switchRound(round: number) {
    this.viewedRound = round;
    const matches = this.roundMatches[round];

    if (matches && matches.length > 0) {
      let previousPairs: Match[] = [];
      if (round === 2) previousPairs = this.event?.pairsFirstRound || [];
      else if (round === 3) previousPairs = this.event?.pairsSecondRound || [];

      this.roundTables[round] = this.buildTablesFromMatches(matches, round, previousPairs);
    } else {
      this.buildEmptyTablesForRound(round);
    }
  }

  /**
     * Show Generate button if:
     * 1. No matches exist for the round we are looking at
     * 2. We are on the 'current' track (not looking at a past round)
     */
  get canGenerateMatches(): boolean {
    if (!this.event) return false;

    const matchesExist = this.roundMatches[this.viewedRound] && this.roundMatches[this.viewedRound].length > 0;

    // Rule: We can generate if no matches exist for this round AND:
    // 1. It is Round 1 and nothing has started (event.currentRound === 0)
    // 2. OR the viewed round is the next logical step after the current progress
    const isFreshStart = (this.viewedRound === 1 && this.event.currentRound === 0);
    const isNextRound = (this.viewedRound === this.currentRound + 1);

    return !matchesExist && (isFreshStart || isNextRound);
  }

  /**
   * Overriding your existing isStartRoundDisabled
   */
  get isStartRoundDisabled(): boolean {
    if (!this.event) return true;

    const matchesExist = this.roundMatches[this.viewedRound] && this.roundMatches[this.viewedRound].length > 0;

    // Disable if:
    // 1. No matches exist yet (user needs to click Generate first)
    // 2. The round is already finished
    const isRoundDone = this.viewedRound <= (this.event.currentRound || 0);

    return !matchesExist || isRoundDone;
  }
  /**
   * Toggles swap mode on or off. When swap mode is on, the organizer
   * can select a pair of men or a pair of women and swap their seats.
   */
  toggleSwapMode() {
    this.swapMode = !this.swapMode;
    this.selectedMen = [];
    this.selectedWomen = [];

    if (this.swapMode) {
      // make a deep copy of the current round tables
      this.swapTables = this.tablesForCurrentRound.map(table => ({
        tableNumber: table.tableNumber,
        seats: table.seats.map(seat => ({ ...seat }))
      }));
    } else {
      this.swapTables = [];
    }
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
    const swapSeats = (seats: Seat[]) => {
      if (seats.length === 2) {
        const [a, b] = seats;
        [a.user, b.user] = [b.user, a.user];
        [a.userId, b.userId] = [b.userId, a.userId];
        [a.userName, b.userName] = [b.userName, a.userName];
        [a.feedback, b.feedback] = [b.feedback, a.feedback];
        [a.hasFeedback, b.hasFeedback] = [b.hasFeedback, a.hasFeedback];
        seats.length = 0;
      }
    };

    swapSeats(this.selectedMen);   // must be from swapTables
    swapSeats(this.selectedWomen); // must be from swapTables
  }

  /**
   * Ends swap mode and clears all selections
   */
  saveSwapChanges() {
    // overwrite actual round tables with swapTables
    this.roundTables[this.viewedRound] = this.swapTables.map(table => ({
      tableNumber: table.tableNumber,
      seats: table.seats.map(seat => ({ ...seat }))
    }));

    this.swapMode = false;
    this.selectedMen = [];
    this.selectedWomen = [];
    this.swapTables = [];

    this.messageService.showSuccessMessage('Swap changes applied!', 3);
  }

  /**
   * Toggles the matching visualization on or off.
   */
  toggleVisualization() {
    this.showVisualization = true;  // show visualization
    this.swapMode = false;           // disable swap mode
    this.selectedMen = [];           // clear any swap selections
    this.selectedWomen = [];
  }

  /** Only return User objects from registeredMen */
  get registeredMenUsers(): User[] {
    return (this.event?.registeredMen || []).filter(
      (u): u is User => typeof u !== 'string'
    );
  }

  /** Only return User objects from registeredWomen */
  get registeredWomenUsers(): User[] {
    return (this.event?.registeredWomen || []).filter(
      (u): u is User => typeof u !== 'string'
    );
  }

  /**
 * Exits swap mode without applying any changes.
 */
  cancelSwap() {
    this.swapMode = false;
    this.selectedMen = [];
    this.selectedWomen = [];
    this.messageService.showSuccessMessage('Exited swap mode without changes', 3);
  }
}
