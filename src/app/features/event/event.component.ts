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

  //@Input() event!: Event;
  @Input() isRegistered: boolean = false;
  @Input() userGender: 'man' | 'woman' | null = null;

  @Output() registerClicked = new EventEmitter<void>();
  @Output() unregisterClicked = new EventEmitter<void>();

  event: Event = {
  id: "1",
  title: 'Valentine Speed Dating',
  description: 'An evening of fun and fast-paced connections. Meet new people in a relaxed atmosphere.',
  date: new Date('2026-03-14'),
  location: 'Stockholm City Lounge',
  maxSpots: 10, // 5 men + 5 women
  registeredWomen: ['w1', 'w2', 'w3', 'w4', 'w5'], // FULL for women
  registeredMen: ['m1', 'm2'], // 2/5 men
  pairsFirstRound: [],
  pairsSecondRound: [],
  pairsThirdRound: []
};

  /** Max spots per gender */
  get maxPerGender(): number {
    return this.event.maxSpots / 2;
  }

  /** Whether the register button should be disabled */
  get isRegisterDisabled(): boolean {
    return !this.userGender || this.availableSpotsForUser <= 0;
  }

  /** Number of available spots for the user's gender */
  get availableSpotsForUser(): number {
    if (!this.userGender) return 0;

    if (this.userGender === 'woman') {
      return this.maxPerGender - this.registeredWomenCount;
    }

    return this.maxPerGender - this.registeredMenCount;
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
