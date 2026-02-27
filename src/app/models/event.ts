import { User } from './user';
import { Match } from './match';

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSpots: number;

  registeredMen: (string | User)[];
  registeredWomen: (string | User)[];

  pairsFirstRound: Match[];
  pairsSecondRound: Match[];
  pairsThirdRound: Match[];

  img?: string;
}
