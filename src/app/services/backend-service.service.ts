import { Injectable } from '@angular/core';
import { Event } from '../models/event';
import { User } from '../models/user';
import { Interest } from '../models/interest';

@Injectable({
  providedIn: 'root',
})
export class BackendServiceService {
  private API_URL: string = 'http://localhost:3000/api/v1';

  constructor() {}

  /**
   * Retrieves a list of all interests from the backend.
   * Sends a GET request to the API to fetch the data.
   *
   * @async
   * @function
   * @returns {Promise<any>} A promise that resolves to the list of interests.
   * @throws {Error} If the request fails or the response is not successful.
   */
  async getAllInterests(): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/interests`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Registers a new user by sending a POST request to the backend API.
   *
   * @async
   * @function
   * @param {Object} user - The user data to be registered. It includes properties like username, password, etc.
   * @returns {Promise<any>} A promise that resolves to the created user data.
   * @throws {Error} If the registration request fails or the backend returns an error.
   */
  async registerUser(user: any): Promise<any> {
    try {
      // Send POST request to backend to log the user in
      const response = await fetch(`${this.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMsg = await response.json();

        throw new Error(errorMsg.error);
      }

      const createdUser = await response.json();

      return createdUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Authenticates a user by sending a login request to the backend API.
   * On successful login, the user data is saved in localStorage for session persistence.
   *
   * @async
   * @function
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password provided by the user.
   * @returns {Promise<any>} A promise that resolves to the user data if login is successful.
   * @throws {Error} If the login request fails or the backend returns an error.
   */
  async loginUser(username: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg.error);
      }

      const userData = await response.json();

      localStorage.setItem('user', JSON.stringify(userData.user));

      return userData;
    } catch (error: any) {
      throw error;
    }
  }

  // TODO: Implement to fetch all events
  async getAllEvents() : Promise<Event<string>[]> {
    const res = await fetch('');

    return await res.json()
  }

  //TODO: Implement get user by id
  async getUserById(id: string) : Promise<User> {
    const res = await fetch('');

    return await res.json()
  }

  //TODO: Implement registration of user for an event
  async registerUserForEvent(eventId: string, userId: string) : Promise<any> {
    const res = await fetch('');

    return await res.json()
  }

  //TODO: Implement UNregistration of user from an event
  async unregisterUserFromEvent(eventId: string, userId: string) : Promise<any> {
    const res = await fetch('');

    return await res.json()
  }
}
