import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatPairComponent } from './seat-pair/seat-pair.component';

export interface Seat {
  id: string;
  position: 'left' | 'right';
  tableNumber: number;
  userId?: string;
  userName?: string;
  profilePicture?: string;
}

export interface Table {
  id: number;
  seats: Seat[];
}

@Component({
  selector: 'app-seating',
  imports: [CommonModule, SeatPairComponent],
  templateUrl: './seating.component.html',
  styleUrl: './seating.component.scss'
})
export class SeatingComponent {
  isOrganizer = false;
  currentUserId = 'user123';

  tables: Table[] = [
    {
      id: 1,
      seats: [
        { id: '1-left', position: 'left', tableNumber: 1 },
        { id: '1-right', position: 'right', tableNumber: 1 }
      ]
    },
    {
      id: 2,
      seats: [
        { id: '2-left', position: 'left', tableNumber: 2 },
        { id: '2-right', position: 'right', tableNumber: 2 }
      ]
    },
    {
      id: 3,
      seats: [
        { id: '3-left', position: 'left', tableNumber: 3 },
        { id: '3-right', position: 'right', tableNumber: 3 }
      ]
    },
    {
      id: 4,
      seats: [
        { id: '4-left', position: 'left', tableNumber: 4 },
        { id: '4-right', position: 'right', tableNumber: 4 }
      ]
    },
    {
      id: 5,
      seats: [
        { id: '5-left', position: 'left', tableNumber: 5, userId: 'user123', userName: 'You' },
        { id: '5-right', position: 'right', tableNumber: 5 }
      ]
    },
    {
      id: 6,
      seats: [
        { id: '6-left', position: 'left', tableNumber: 6 },
        { id: '6-right', position: 'right', tableNumber: 6 }
      ]
    },
    {
      id: 7,
      seats: [
        { id: '7-left', position: 'left', tableNumber: 7 },
        { id: '7-right', position: 'right', tableNumber: 7 }
      ]
    },
    {
      id: 8,
      seats: [
        { id: '8-left', position: 'left', tableNumber: 8 },
        { id: '8-right', position: 'right', tableNumber: 8 }
      ]
    },
    {
      id: 9,
      seats: [
        { id: '9-left', position: 'left', tableNumber: 9 },
        { id: '9-right', position: 'right', tableNumber: 9 }
      ]
    },
    {
      id: 10,
      seats: [
        { id: '10-left', position: 'left', tableNumber: 10 },
        { id: '10-right', position: 'right', tableNumber: 10 }
      ]
    }
  ];
}
