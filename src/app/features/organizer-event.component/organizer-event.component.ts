import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { Event } from '../../models/event';

@Component({
  selector: 'app-organizer-event',
  templateUrl: './organizer-event.component.html',
  styleUrls: ['./organizer-event.component.scss']
})
export class OrganizerEventComponent implements OnInit {

  eventId!: string;
  event?: Event;

  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService
  ) {}

  /**
   * On component initialization, extract the event ID from the route parameters
   * and load the event details from the backend.
   */
  async ngOnInit() {

    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.event = await this.backendService.getEventById(this.eventId);
    console.log('Loaded event:', this.event);
  }
}
