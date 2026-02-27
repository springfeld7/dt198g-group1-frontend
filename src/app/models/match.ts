import { User } from './user';
import { Review } from './review';

export interface Match {
  _id: string;
  man: string | User;
  woman: string | User;
  reviews: (string | Review)[];
}
