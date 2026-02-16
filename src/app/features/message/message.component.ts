import { Component, Input } from '@angular/core';
import { MessageService } from '../../services/message.service';


/**
 * Component for displaying user-facing messages.
 * Supports three types of messages: 
 * - 'success': green, indicates a successful operation
 * - 'error': red, indicates a failed operation
 * - 'warning': yellow, indicates a caution or important notice
 *
 * Placement options:
 * - 'global': top-of-page banner (fixed to viewport)
 * - 'local': inline message positioned relative to parent container
 *
 * Listens to the reactive `MessageService` signal.
 */
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  /**
   * Determines the placement of the message:
   * - 'global': top-of-page banner (fixed to viewport)
   * - 'local': inline message positioned relative to parent container
   */
  @Input() placement: 'global' | 'local' = 'global';

  /**
   * Getter for the reactive message signal from the MessageService.
   * Access the current message with `message()` in the template.
   */
  get message() {
    return this.messageService.message;
  }

  constructor(private messageService: MessageService) {}

  /**
   * Clears the current message manually (e.g., on click).
   */
  closeMessage() {
    this.messageService.clearMessage();
  }
}
