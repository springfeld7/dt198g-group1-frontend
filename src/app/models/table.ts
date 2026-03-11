import { Seat } from './seat';

export interface Table {
  tableNumber: number;
  seats: Seat[];
}
