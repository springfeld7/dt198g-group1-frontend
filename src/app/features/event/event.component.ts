import { Component, Input } from '@angular/core';
import { Event } from '../../models/event';

@Component({
  selector: 'app-event',
  imports: [],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {
  @Input() event!: Event;
}
