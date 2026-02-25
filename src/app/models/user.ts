import { Interest } from "./interest";

export interface User {
    _id: string;
    username: string;
    isAdmin: boolean;
    firstName?: string;
    surname?: string;
    email?: string;
    phone?: string;
    location?: string;
    gender?: 'man' | 'woman';
    age?: number;
    interests?: Interest[];
    matches?: {
        user: string | User;
        isSeen: boolean;
        matchedAt: Date;
    }[];
    img?: string;
}
