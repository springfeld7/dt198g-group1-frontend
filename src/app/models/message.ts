/**
 * Represents a message to be displayed in the user interface.
 * The message can be of type 'success' or 'error', and is used
 * to indicate the success or failure of various operations.
 */
export interface Message {
    message: string,
    type: 'success' | 'error' 
}
