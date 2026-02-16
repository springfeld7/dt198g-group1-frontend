import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventComponent } from '../event/event.component';
import { BackendServiceService } from '../../services/backend-service.service';
import { Event } from '../../models/event';

@Component({
  selector: 'app-feed',
  imports: [EventComponent, CommonModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  private backendService = inject(BackendServiceService);
  eventList: Event[] = [];
  futureEvents: Event[] = [];
  isLoggedIn = !!localStorage.getItem('userId');
  isAdmin: boolean = false;
  userId: string = "";

  /**
   * Uses the backend service to fetch all events.
   * Checks if a user is logged in via localStorage to determine privileges.
   * Filters out future events and sorts all events by date.
   */
  ngOnInit() {
    if (this.isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        this.isAdmin = user.isAdmin;
        this.userId = user.userId;
      }

      this.backendService.getAllEvents()
      .then(events => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.eventList = events;
        this.eventList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.futureEvents = this.eventList.filter(e => new Date(e.date) >= today);
        this.futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
    }
  }
}
