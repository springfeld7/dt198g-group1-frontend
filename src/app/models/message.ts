/**
 * Represents a message to be displayed in the user interface.
 * The message can be of type 'success', 'error', or 'warning',
 * and is used to indicate the outcome of various operations.
 */
export interface Message {
    message: string;
    type: 'success' | 'error' | 'warning';
}
