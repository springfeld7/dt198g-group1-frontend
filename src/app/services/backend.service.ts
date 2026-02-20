import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Event } from '../models/event';
import { Interest } from '../models/interest';
import { Question } from '../models/question';
import { Review } from '../models/review';
import { User } from '../models/user';
import { LoginResponse } from '../models/login-response';
import { UserRegistration } from '../models/user-registration';

@Injectable({
	providedIn: 'root'
})
export class BackendService {

	readonly API_URL = 'http://localhost:3000';
	readonly API_VERSION = 1;
	readonly API_PATH = `/api/v${this.API_VERSION}`;
	readonly URL = `${this.API_URL}${this.API_PATH}`;

	// Http options to send with the request. 
	// Necessary for sending cookies with the request for authentication.
	httpOptions = {
		withCredentials: true
	};

	constructor(private http: HttpClient) { }

	// ===============================================================
	// AUTHENTICATION METHODS
	// ===============================================================

	/**
	 * Logs in the user.
	 *
	 * @param {string} username - The username of the user attempting to log in.
	 * @param {string} password - The plain text password provided for validation.
	 * @returns {Promise<LoginResponse>} A Promise that resolves to the login response from the server.
	 */
	login(username: string, password: string): Promise<LoginResponse> {
		const endpoint = this.URL + '/auth/login';

		const body = {
			username: username,
			password: password
		}

		const responseObservable = this.http.post<LoginResponse>(endpoint, body, this.httpOptions);

		return firstValueFrom(responseObservable);
	}

	/**
	 * Logs out the logged in user.
	 *
	 * @return {Promise} A Promise that resolves to a success message.
	 */
	logout(): Promise<Object> {
		const endpoint = this.URL + '/auth/logout';

		// Make a logout GET request and return an Observable of the response
		const responseObservable = this.http.post<Object>(endpoint, {}, this.httpOptions);

		// Convert and return the first emitted value to a Promise<Object>
		return firstValueFrom(responseObservable);
	}

	// ===============================================================
	// USER METHODS
	// ===============================================================

	/**
	 * Registers a new user.
	 *
	 * @param {UserRegistration} user - The user registration object containing registration details.
	 * @returns {Promise<User>} A Promise resolving to the created user.
	 */
	registerUser(user: UserRegistration): Promise<User> {
		const endpoint = `${this.URL}/auth/register`;

		return firstValueFrom(
			this.http.post<User>(endpoint, user, this.httpOptions)
		);
	}

	/**
	 * Get a single user by ID.
	 *
	 * @param id - User's unique identifier.
	 * @returns {Promise} A Promise resolving to the user object.
	 */
	getUserById(id: string): Promise<User> {
		const endpoint = `${this.URL}/users/${id}`;
		return firstValueFrom(this.http.get<User>(endpoint, this.httpOptions));
	}

	// ===============================================================
	// EVENT METHODS
	// ===============================================================

	/**
	 * Get all Events from the REST API.
	 * 
	 * @return {Promise} A Promise that resolves to an array of events.
	 */
	getAllEvents(): Promise<Event[]> {
		const endpoint = this.URL + '/events';
		const responseObservable = this.http.get<any[]>(endpoint, this.httpOptions);

		return firstValueFrom(responseObservable).then(events =>
			events.map(event => ({
				...event,
				id: event._id,
				date: new Date(event.date)
			}))
		);
	}

	/**
	 * Register a user for a specific event.
	 *
	 * @param eventId - The unique identifier of the event.
	 * @returns {Promise<Event>} A Promise resolving to the updated event object upon success.
	 */
	registerUserForEvent(eventId: string): Promise<Event> {
		const endpoint = `${this.URL}/events/${eventId}/register`;
		return firstValueFrom(this.http.post<Event>(endpoint, {}, this.httpOptions));
	}

	/**
	 * Unregister a user from a specific event.
	 *
	 * @param eventId - The unique identifier of the event.
	 * @returns {Promise<Event>} A Promise resolving to the updated event object upon success.
	 */
	unregisterUserFromEvent(eventId: string): Promise<Event> {
		const endpoint = `${this.URL}/events/${eventId}/register`;
		return firstValueFrom(this.http.delete<Event>(endpoint, this.httpOptions));
	}


	// ===============================================================
	// INTEREST METHODS
	// ===============================================================

	/**
	  * Get all interests from the REST API.
	  *
	  * @returns {Promise<Interest[]>} A Promise that resolves to an array of interests.
	  */
	getAllInterests(): Promise<Interest[]> {
		const endpoint = `${this.URL}/interests`;

		return firstValueFrom(
			this.http.get<Interest[]>(endpoint, this.httpOptions)
		);
	}
}
