import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatPairComponent } from './seat-pair/seat-pair.component';
import { AuthService } from '../../services/auth.service';
import { Table } from '../../models/table';
import { Seat } from '../../models/seat';

@Component({
  selector: 'app-seating',
  imports: [CommonModule, SeatPairComponent],
  templateUrl: './seating.component.html',
  styleUrls: ['./seating.component.scss']
})
export class SeatingComponent implements OnInit {
  @Input() maxSpots!: number;
  @Input() tables: Table[] = [];
  isAdmin = false;
  currentUserId = '';

  private authService = inject(AuthService);

  /**
   * Sets up the seating arrangement when the component initializes. It checks if the current user
   * is an admin and retrieves the user ID. If no tables are provided by the parent component,
   * it generates a default set of empty tables based on the maximum number of spots.
   * Each table has two seats (left and right) that can be occupied by participants.
   */
  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.isAdmin = this.authService.getIsAdmin();

    // If parent did not provide tables, generate default empty tables
    if (!this.tables || this.tables.length === 0) {
      const numTables = Math.ceil(this.maxSpots / 2);
      this.tables = Array.from({ length: numTables }, (_, i) => ({
        tableNumber: i + 1,
        seats: [
          { position: 'left', tableNumber: i + 1 },
          { position: 'right', tableNumber: i + 1 }
        ]
      }));
    }
  }
}
