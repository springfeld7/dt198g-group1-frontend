import { Injectable } from '@angular/core';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class BackendServiceService {

  constructor() { }

  // TODO: Implement to fetch all events
  async getAllEvents() : Promise<Event<string>[]> {
    const res = await fetch('');

    return await res.json()
  }
}
