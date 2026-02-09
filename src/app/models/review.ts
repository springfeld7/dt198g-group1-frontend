export interface Review {
    id: number;
    reviewer: string;
    eventId: number;
    round: number;
    dateId: number;
    answers: { [questionId: number]: boolean | string };
}
