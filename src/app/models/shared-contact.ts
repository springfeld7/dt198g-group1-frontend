export interface SharedContact {
    _id: string;
    firstName: string;
    surname: string;
    email: string;
    phone: string;
    isSeen: boolean;
    matchedAt: string | Date;
    img: string;
}
