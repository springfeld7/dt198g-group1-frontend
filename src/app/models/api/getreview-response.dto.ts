import { Review } from '../review';

export interface EventReviewsResponse {
    firstRound: Review[] | null;
    secondRound: Review[] | null;
    thirdRound: Review[] | null;
}
