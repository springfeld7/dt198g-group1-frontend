import { User } from './user';

export interface Event<T extends string | User = string> {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSpots: number;
  registeredMen: T[];
  registeredWomen: T[];
  pairsFirstRound: [T, T][];
  pairsSecondRound: [T, T][];
  pairsThirdRound: [T, T][];
  img?: string;
}
