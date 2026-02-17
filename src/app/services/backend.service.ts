import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Event } from '../models/event';
import { Interest } from '../models/interest';
import { Question } from '../models/question';
import { Review } from '../models/review';
import { User } from '../models/user';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

	readonly API_URL = 'http://localhost:4200';
	readonly API_VERSION = 1;
	readonly API_PATH = `/api/v${this.API_VERSION}`;
	readonly URL = `${this.API_URL}${this.API_PATH}`;

	// Http options to send with the request. Needed to work with express-session
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
		const endpoint = this.URL + '/users/login';
		
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
		const endpoint = this.URL + '/users/logout';

		// Make a logout GET request and return an Observable of the response
		const responseObservable = this.http.get<Object>(endpoint, this.httpOptions);

		// Convert and return the first emitted value to a Promise<Object>
		return firstValueFrom(responseObservable);
	}
}

