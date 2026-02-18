export interface Question {
    _id: string;
    text: string;
    type: 'boolean' | 'multipleChoice' | 'text';
    options?: string[];
}
