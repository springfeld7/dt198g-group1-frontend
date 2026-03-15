import { User } from './user';
import { Review } from './review';

export interface Match {
  _id?: string;
  man: string | User;
  woman: string | User;
  tableNumber: number;
  startTime?: Date;
  manSeat: 'left' | 'right';
  womanSeat: 'left' | 'right';
  reviews?: (string | Review)[];
  likedBy?: Record<string, boolean>;
}
