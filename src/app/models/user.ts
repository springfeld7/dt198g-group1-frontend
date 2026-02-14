export interface User {
    _id: string;
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
    interests: string[]; // interestsID's
    matches: string[]; // userID's
    registeredEvents: string[]; // eventID's
}
