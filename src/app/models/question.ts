export interface Question {
    id: string;
    text: string;
    type: 'boolean' | 'multipleChoice' | 'text';
    options?: string[];
}
