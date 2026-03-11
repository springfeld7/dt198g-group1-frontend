import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { MessageService } from '../../services/message.service';
import { Event } from '../../models/event';
import { SeatingComponent } from '../seating/seating.component';

@Component({
  selector: 'app-organizer-event',
  imports: [SeatingComponent],
  templateUrl: './organizer-event.component.html',
  styleUrls: ['./organizer-event.component.scss']
})
export class OrganizerEventComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  eventId!: string;
  event?: Event;


  /**
   * Loads the event from the backend when the component initializes.
   */
  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    try {
      this.event = await this.backendService.getEventById(this.eventId);
      console.log('Loaded event:', this.event);

    } catch (error) {
      console.error('Failed to load event:', error);

      this.messageService.showErrorMessage(
        'Failed to load the event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        5
      );
    }

    


  }


}
