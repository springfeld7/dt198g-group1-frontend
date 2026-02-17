import { Injectable, signal, WritableSignal } from '@angular/core';
import { Message } from '../models/message';

/**
 * Service for delivering messages to be displayed in the user interface. This
 * service allows components to send messages, which can be used to indicate
 * the success or failure of various operations.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  /**
   * Private writable signal holding the current message.
   */
  private messageSignal: WritableSignal<Message | null> = signal(null);

  /**
   * Public read-only signal for subscribing to messages.
   */
  readonly message = this.messageSignal.asReadonly();

  /**
   * Shows a message of a specific type.
   * 
   * @param message - The message content and type
   * @param autoCloseTime - Time in seconds after which the message auto-hides; 0 = never
   */
  private showMessage(message: Message, autoCloseTime: number = 0) {
    this.messageSignal.set(message);

    if (autoCloseTime > 0) {
      setTimeout(() => {
        this.messageSignal.set(null);
      }, autoCloseTime * 1000);
    }
  }

  /**
   * Displays a success message.
   */
  showSuccessMessage(message: string, autoCloseTime: number = 0) {
    this.showMessage({ message, type: 'success' }, autoCloseTime);
  }

  /**
   * Displays an error message.
   */
  showErrorMessage(message: string, autoCloseTime: number = 0) {
    this.showMessage({ message, type: 'error' }, autoCloseTime);
  }

  /**
   * Displays a warning message.
   */
  showWarningMessage(message: string, autoCloseTime: number = 0) {
    this.showMessage({ message, type: 'warning' }, autoCloseTime);
  }

  /**
   * Clears the current message manually.
   */
  clearMessage() {
    this.messageSignal.set(null);
  }
}
