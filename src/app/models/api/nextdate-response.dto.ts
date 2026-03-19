/**
 * @fileoverview
 * DTO for participant's next date response in an event round.
 */

import { Review } from "../review";

export interface InterestDto {
  name: string;
}

export interface NextDateUserDto {
  _id: string;
  firstName: string;
  surname: string;
  interests: InterestDto[];
  img: string;
}

export type SeatType = 'left' | 'right';

export interface NextDateResponseDto {
  user: NextDateUserDto;
  tableNumber: number;
  seat: SeatType;
  startTime: Date;
  review: Review | null;
}
