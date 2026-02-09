export interface User {
    id: number;
    username: string;
    password: string;
    isAdmin: boolean;

    firstName: string;
    surname: string;
    email: string;
    phone: string;
    location: string;

    gender: 'man' | 'woman';
    age: number;

    interests: number[]; // interestsID's
    matches: number[]; // userID's
    registeredEvents: number[]; // eventID's
}
