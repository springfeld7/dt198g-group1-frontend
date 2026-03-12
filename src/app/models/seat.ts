import { User } from './user';

export interface Seat {
  position: 'left' | 'right';
  tableNumber: number;
  userId?: string;           // Optional: populated for organizer or after match
  userName?: string;         // Optional: display name of the participant
  user?: User;
  profilePicture?: string;   // Optional: URL for participant image
  hasFeedback?: boolean;
}
