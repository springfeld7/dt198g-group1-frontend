import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BackendService } from './backend.service';
import { MessageService } from './message.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  /**
   * Service to handle backend operations.
   */
  backend: BackendService = inject(BackendService);

  /**
   * Service to handle messages.
   */
  messageService: MessageService = inject(MessageService);

  /**
   * Inject router for navigation.
   */
  router: Router = inject(Router);

  constructor() { }

  /**
   * Exposes the current logged-in status as an observable.
   * Other components can subscribe to this for real-time updates.
   */
  isLoggedIn$(): BehaviorSubject<boolean> {
    return this.isLoggedInSubject;
  }

  /**
   * Gets the user id from session storage if it exists.
   * @return {string} user id or empty string if does not exist.
   */
  getUserId(): string {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.id || ''; // Return _id if it exists, otherwise empty string
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        return '';
      }
    }
    return '';
  }

  /**
   * Gets the username from session storage if it exists.
   * @return {string} username or empty string if does not exist.
   */
  getUsername(): string {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.username || ''; // Return username if it exists, otherwise empty string
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        return '';
      }
    }
    return '';
  }

  /**
   * Check if user is logged in.
   * @return whether the user is logged in.
   */
  private isLoggedIn(): boolean {
    return sessionStorage.getItem('user') !== null;
  }

  /**
   * Logs the user in.
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The plain text password provided for validation.
   * @return {Promise<void>} A promise that resolves when the login process is complete,
   * or rejects with an error if the login fails.
   */
  async login(username: string, password: string): Promise<void> {
    try {
      const response = await this.backend.login(username, password);

      const user: User = {
        id: response.user.userId,
        username: response.user.username,
        isAdmin: response.user.isAdmin
      };

      // Store user information in session storage
      sessionStorage.setItem('user', JSON.stringify(user));

      // Update logged-in status
      this.isLoggedInSubject.next(this.isLoggedIn());

      //Show success message
      this.messageService.showSuccessMessage(`Welcome ${this.getUsername()}! You have successfully logged in.`, 5);

    } catch (error) {

      let msg = 'An unexpected error occurred'; //Fallback message

      if (error instanceof HttpErrorResponse) {
        msg = error.error?.error || error.message || msg;
      }
      this.messageService.showErrorMessage(msg, 0);
      console.error('Error while logging in:', error);
    }
  }

  /**
   * Logs out the user. Clears session storage, updates login status,
   * redirects to the main page, and shows an error message if the backend fails.
   */
  logout(): void {
    this.backend.logout()
      .then(() => {
        // Successful logout
        sessionStorage.removeItem('user');
        this.isLoggedInSubject.next(false);
        this.router.navigate(['']);
      })
      .catch(error => {
        let msg = 'Logout failed';
        if (error instanceof HttpErrorResponse) {
          msg = error.error?.error || error.message || msg;
        }
        this.messageService.showErrorMessage(msg, 0);
        console.error('Logout error:', error);
      });
  }
}
