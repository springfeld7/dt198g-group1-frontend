export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSpots: number;
  registeredMen: number[];
  registeredWomen: number[];
  pairsFirstRound: [number, number][];
  pairsSecondRound: [number, number][];
  pairsThirdRound: [number, number][];
}
