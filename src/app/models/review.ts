export interface Review {
    id: string;
    reviewer: string;
    eventId: string;
    round: number;
    dateId: string;
    answers: { [questionId: string]: boolean | string };
}
