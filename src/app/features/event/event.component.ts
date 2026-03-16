import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {

  private router = inject(Router);
  @Input() event!: Event;
  @Input() isRegistered: boolean = false;
  @Input() userGender: 'man' | 'woman' | null = null;
  @Input() isAdmin: boolean = false;

  @Output() registerClicked = new EventEmitter<void>();
  @Output() unregisterClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<void>();

  countdown: string = '';
  private intervalId?: number;

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = window.setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

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

  get showManageButton(): boolean {
    if (!this.isAdmin || !this.event?.date) return false;

    const now = new Date().getTime();
    const eventTime = new Date(this.event.date).getTime();

    // Show button from 15 minutes before until 1h15m after start
    const fifteenMinutesMs = 15 * 60 * 1000;
    const seventyFiveMinutesMs = 75 * 60 * 1000;

    return now >= eventTime - fifteenMinutesMs && now <= eventTime + seventyFiveMinutesMs;
  }

  get isCheckInActive(): boolean {
    // Only for non-admins: after event started but within first hour
    if (this.isAdmin) return false;

    const now = new Date().getTime();
    const eventTime = new Date(this.event.date).getTime();
    const oneHourMs = 60 * 60 * 1000;

    return now >= eventTime && now <= eventTime + oneHourMs;
  }

  /** Updates the countdown string */
  updateCountdown(): void {
    const now = new Date().getTime();
    const eventTime = new Date(this.event.date).getTime();
    const oneHourMs = 60 * 60 * 1000;
    const diffMs = eventTime - now;

    if (diffMs > 0) {
      // Event hasn't started yet, show full countdown
      let totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      this.countdown = `Starts in: ${days ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
    } else if (diffMs <= 0 && diffMs > -oneHourMs) {
      // Event started within last hour
      this.countdown = 'Has started!';
    } else {
      // Event ended more than 1 hour ago
      this.countdown = '';
      if (this.intervalId) clearInterval(this.intervalId); // stop interval
    }
  }

  /** Returns true if the event has started (for Check in state) */
  get eventStarted(): boolean {
    const now = new Date().getTime();
    const eventTime = new Date(this.event.date).getTime();
    return now >= eventTime;
  }

  /** Emits an event when the user clicks the register button. */
  onRegister(): void {
    this.registerClicked.emit();
  }

  /** Emits an event when the user clicks the unregister button. */
  onUnregister(): void {
    this.unregisterClicked.emit();
  }

  /** Emits an event when the user clicks the edit button. */
  onEdit(): void {
    this.editClicked.emit();
  }

  /** Handler for the Check in button */
  onCheckIn(): void {
    console.log('Check in clicked for', this.event.title);

    if (!this.event?._id) return;

    // Navigate to /events/:eventId
    this.router.navigate(['/events', this.event._id]);
  }

  /** Navigates to manage event page */
  onManage(): void {
    console.log('Manage clicked for', this.event.title);
    if (!this.event?._id) return;
    // Navigate to /events/:eventId/manage
    this.router.navigate(['/events', this.event._id, 'manage']);
  }
}
