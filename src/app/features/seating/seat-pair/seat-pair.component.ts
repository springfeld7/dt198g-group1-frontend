import { Component, Input, Output, inject, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table } from '../../../models/table';
import { Seat } from '../../../models/seat';
import { BackendService } from '../../../services/backend.service';
import { Event as EventModel } from '../../../models/event';
import { OrganizerEventProfileComponent } from '../../organizer-event-profile/organizer-event-profile';

@Component({
  selector: 'app-seat-pair',
  imports: [CommonModule, OrganizerEventProfileComponent],
  templateUrl: './seat-pair.component.html',
  styleUrls: ['./seat-pair.component.scss']
})
export class SeatPairComponent {
  @Input() event!: EventModel;
  @Input() table!: Table;
  @Input() isOrganizer = false;
  @Input() currentUserId: string = '';
  @Input() swapMode = false;
  @Input() selectedMen: Seat[] = [];
  @Input() selectedWomen: Seat[] = [];
  @Output() seatSelectedForSwap = new EventEmitter<Seat>();
  hoveredSeat?: Seat;

  @ViewChild(OrganizerEventProfileComponent) profileModal!: OrganizerEventProfileComponent;

  private backendService = inject(BackendService);

  isCurrentUserSeat(position: 'left' | 'right'): boolean {
    const seat = this.getSeatByPosition(position);
    return !!seat?.userId && seat.userId === this.currentUserId;
  }

  getSeatTitle(position: 'left' | 'right'): string {
    const seat = this.getSeatByPosition(position);
    if (!seat?.userId) return 'Empty seat';
    if (seat.userId === this.currentUserId) return 'Your seat';
    return 'Occupied seat';
  }

  private getSeatByPosition(position: 'left' | 'right'): Seat | undefined {
    return this.table?.seats.find((seat) => seat.position === position);
  }

  get leftSeat(): Seat | undefined {
    return this.getSeatByPosition('left');
  }

  get rightSeat(): Seat | undefined {
    return this.getSeatByPosition('right');
  }

  // seat-pair.component.ts
  getLeftSeatPicture(): string | null {
    return this.isOrganizer && this.leftSeat?.userId
      ? this.getProfilePicUrl(this.leftSeat.userId)
      : null;
  }

  getRightSeatPicture(): string | null {
    return this.isOrganizer && this.rightSeat?.userId
      ? this.getProfilePicUrl(this.rightSeat.userId)
      : null;
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
   * Fallback for image loading errors.
   */
  handleImageError(event: Event): void {
    const imgEl = event.target as HTMLImageElement;
    imgEl.src = '/assets/default-profile.jpg';
  }

  /**
   * Open a profile.
   */
  openProfile(seat: Seat | undefined): void {
    if (seat?.user && this.event) {
      this.profileModal.open(seat.user, this.event);
    }
  }

  /**
   * Helper to check if a seat is selected for swap (used for CSS highlighting)
   */
  isSelectedForSwap(seat: Seat): boolean {
    return this.selectedMen.includes(seat) || this.selectedWomen.includes(seat);
  }

  /**
   * Handles the click event for a seat.
   * @param seat The seat that was clicked.
   */
  seatClicked(seat: Seat | undefined): void {
    if (this.swapMode) {
      this.seatSelectedForSwap.emit(seat);
      return;
    }

    if (this.isOrganizer) {
      this.openProfile(seat);
    }
  }
}

