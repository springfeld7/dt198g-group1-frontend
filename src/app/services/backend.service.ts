import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Event } from '../models/event';
import { Interest } from '../models/interest';
import { Question } from '../models/question';
import { Review } from '../models/review';
import { User } from '../models/user';
import { LoginResponse } from '../models/api/login-response.dto';
import { RegistrationResponse } from '../models/api/reg-response.dto';
import { UserRegistration } from '../models/api/user-registration.dto';
import { DeleteEventResponse } from '../models/api/delete-event-response.dto';
import { UserUpdateData } from '../models/api/user-update.dto';

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
	// AUTHENTICATION AND REGISTRATION METHODS
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

	/**
	 * Registers a new user.
	 *
	 * @param {UserRegistration} user - The user registration object containing registration details.
	 * @returns {Promise<User>} A Promise resolving to the created user.
	 */
	registerUser(user: UserRegistration): Promise<RegistrationResponse> {
		const endpoint = `${this.URL}/auth/register`;

		return firstValueFrom(
			this.http.post<RegistrationResponse>(endpoint, user, this.httpOptions)
		);
	}

	// ===============================================================
	// USER METHODS
	// ===============================================================

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

	/**
	 * Retrieves all users from the database.
	 * 
	 * @returns {Promise<User[]>} A Promise resolving to an array of User objects.
	 */
	getAllUsers(): Promise<User[]> {
		const endpoint = `${this.URL}/users`;

		return firstValueFrom(this.http.get<User[]>(endpoint, this.httpOptions));
	}

	/**
	 * Updates a user's profile.
	 *
	 * @param {UserUpdateData} userData - Any combination of user profile fields.
	 */
	updateUser(userData: UserUpdateData): Promise<User> {
		return firstValueFrom(this.http.put<User>(`${this.URL}/users`, userData, this.httpOptions));
	}

	/**
	 * Retrieves all matches for a specific user.
	 * 
	 * @param {string} id - The User ID to find matches for.
	 * @returns {Promise<User[]>} A Promise resolving to an array of matched User objects.
	 */
	getUserMatches(id: string): Promise<User[]> {
		const endpoint = `${this.URL}/users/${id}/matches`;

		return firstValueFrom(
			this.http.get<User[]>(endpoint, this.httpOptions)
		);
	}

	/**
	 * Removes a match between the current user and a matched user.
	 *
	 * @param {string} matchId - The ID of the user to be removed from matches.
	 * @returns {Promise<any>} A promise resolving to the server response.
	 */
	removeMatch(matchId: string): Promise<any> {
		const endpoint = `${this.URL}/users/matches/${matchId}`;

		return firstValueFrom(this.http.delete<any>(endpoint, this.httpOptions));
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
				date: new Date(event.date)
			}))
		);
	}

	/**
	 * Retrieves a specific event from the database by id.
	 *
	 * @param {string} id - The unique id of the event to retrieve.
	 * @returns {Promise<Event>} A Promise that resolves to the Event object.
	 */
	getEventById(id: string): Promise<Event> {
		const endpoint = `${this.URL}/events/${id}`;

		return firstValueFrom(this.http.get<Event>(endpoint, this.httpOptions)
		).then(event => ({
			...event,
			date: new Date(event.date)
		}));
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

	/**
	 * Posts a new event to the database.
	 * 
	 * @param {Partial<Event>} eventData - Object containing title, description, date, location, and maxSpots.
	 * @returns {Promise<Event>} A Promise resolving to the newly created event.
	 */
	createEvent(eventData: Partial<Event>): Promise<Event> {
		const endpoint = `${this.URL}/events`;

		return firstValueFrom(this.http.post<Event>(endpoint, eventData, this.httpOptions)
		).then(event => ({
			...event,
			date: new Date(event.date)
		}));
	}

	/**
	 * Updates an existing event in the database.
	 * 
	 * @param {string} id - The unique ID of the event to update.
	 * @param {Partial<Event>} updates - The fields to update.
	 * @returns {Promise<Event>} A Promise resolving to the updated event.
	 */
	updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
		const endpoint = `${this.URL}/events/${id}`;

		return firstValueFrom(this.http.put<Event>(endpoint, updates, this.httpOptions)
		).then(event => ({
			...event,
			date: new Date(event.date)
		}));
	}

	/**
	 * Deletes an event from the database (Admin only).
	 * @param {string} id - The unique ID of the event to delete.
	 * @returns {Promise<DeleteEventResponse>} A Promise resolving to the deletion message and the deleted event data.
	 */
	deleteEvent(id: string): Promise<DeleteEventResponse> {
		const endpoint = `${this.URL}/events/${id}`;

		return firstValueFrom(this.http.delete<DeleteEventResponse>(endpoint, this.httpOptions));
	}

	// ===============================================================
	// REVIEW METHODS
	// ===============================================================



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

	// ===============================================================
	// QUESTION METHODS
	// ===============================================================

	/**
	 * Fetches all registration questions from the database.
	 *
	 * * @returns {Promise<Question[]>} A Promise resolving to an array of questions.
	 */
	getAllQuestions(): Promise<Question[]> {
		const endpoint = `${this.URL}/questions`;

		return firstValueFrom(
			this.http.get<Question[]>(endpoint, this.httpOptions)
		);
	}

	// ===============================================================
	// IMAGE URL METHODS
	// ===============================================================

	/**
	 * Internal helper to build resource URLs
	 * @param type - 'users' | 'events'
	 * @param id - The resource ID
	 */
	private getPictureUrl(type: 'users' | 'events', id: string): string {
		return `${this.URL}/${type}/${id}/pictures`;
	}

	/**
	 * Public method for User pictures
	 */
	getUserPictureUrl(id: string): string {
		return this.getPictureUrl('users', id);
	}

	/**
	 * Public method for Event pictures
	 */
	getEventPictureUrl(id: string): string {
		return this.getPictureUrl('events', id);
	}
}
