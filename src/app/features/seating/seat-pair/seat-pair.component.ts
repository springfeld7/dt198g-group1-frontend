import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type Seat, type Table } from '../seating.component';

@Component({
  selector: 'app-seat-pair',
  imports: [CommonModule],
  templateUrl: './seat-pair.component.html',
  styleUrl: './seat-pair.component.scss'
})
export class SeatPairComponent {
  @Input() table!: Table;
  @Input() isOrganizer = false;
  @Input() currentUserId: string = '';

  isCurrentUserSeat(position: 'left' | 'right'): boolean {
    const seat = this.getSeatByPosition(position);
    return !!seat?.userId && seat.userId === this.currentUserId;
  }

  getSeatTitle(position: 'left' | 'right'): string {
    const seat = this.getSeatByPosition(position);
    if (!seat?.userId) {
      return 'Empty seat';
    }

    if (seat.userId === this.currentUserId) {
      return 'Your seat';
    }

    return 'Occupied seat';
  }

  private getSeatByPosition(position: 'left' | 'right'): Seat | undefined {
    return this.table?.seats.find((seat) => seat.position === position);
  }

  get leftSeat(): Seat | undefined {
    return this.table?.seats.find(s => s.position === 'left');
  }

  get rightSeat(): Seat | undefined {
    return this.table?.seats.find(s => s.position === 'right');
  }
}
