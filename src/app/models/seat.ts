export interface Seat {
  position: 'left' | 'right';
  tableNumber: number;
  userId?: string;           // Optional: populated for organizer or after match
  userName?: string;         // Optional: display name of the participant
  profilePicture?: string;   // Optional: URL for participant image
  hasFeedback?: boolean;
}
