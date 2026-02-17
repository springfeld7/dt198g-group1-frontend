import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event';

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {

  @Input() event!: Event;
  @Input() isRegistered: boolean = false;
  @Input() userGender: 'man' | 'woman' | null = null;

  @Output() registerClicked = new EventEmitter<void>();
  @Output() unregisterClicked = new EventEmitter<void>();

  /** Max spots per gender */
  get maxPerGender(): number {
    return this.event.maxSpots / 2;
  }

  /** Number of registered women */
  get registeredWomenCount(): number {
    return this.event.registeredWomen.length;
  }

  /** Number of registered men */
  get registeredMenCount(): number {
    return this.event.registeredMen.length;
  }

  /** Emits an event when the user clicks the register button. */
  onRegister(): void {
    this.registerClicked.emit();
  }

  /** Emits an event when the user clicks the unregister button. */
  onUnregister(): void {
    this.unregisterClicked.emit();
  }
}
