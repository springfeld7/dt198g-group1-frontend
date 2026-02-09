export interface Question {
    id: number;
    text: string;
    type: 'boolean' | 'multipleChoice' | 'text';
    options?: string[];
}
