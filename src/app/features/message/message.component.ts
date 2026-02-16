import { Component, Input } from '@angular/core';
import { MessageService } from '../../services/message.service';

/**
 * Component for displaying user-facing messages (success or error).
 * Can appear either as a global banner or inline near the origin of the message.
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
