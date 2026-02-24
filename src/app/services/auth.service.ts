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
    const parsedUser = this.getParsedUser();
    return parsedUser?.id || '';
  }

  /**
   * Gets the username from session storage if it exists.
   * @return {string} username or empty string if does not exist.
   */
  getUsername(): string {
    const parsedUser = this.getParsedUser();
    return parsedUser?.username || '';
  }

  /**
   * Gets the isAdmin flag from session storage if it exists.
   * @return {boolean} true if user is admin, false otherwise.
   */
  getIsAdmin(): boolean {
    const parsedUser = this.getParsedUser();
    return parsedUser?.isAdmin || false;
  }

  /**
 * Helper to get the parsed user object from sessionStorage.
 * @return {any | null} parsed user object or null if not found or invalid.
 */
  private getParsedUser(): any | null {
    const user = sessionStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user from sessionStorage:', error);
      return null;
    }
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
        _id: response.user.userId,
        username: response.user.username,
        isAdmin: response.user.isAdmin
      };

      sessionStorage.setItem('user', JSON.stringify(user));
      this.isLoggedInSubject.next(true);


      this.messageService.showSuccessMessage(`Welcome ${this.getUsername()}! You have successfully logged in.`, 5);

    } catch (error) {

      console.error('Login failed in AuthService:', error);
      throw error;
    }
  }

  /**
   * Logs out the user. Clears session storage, updates login status,
   * redirects to the main page, and shows an error message if the backend fails.
   */
  /**
   * Logs out the user. Clears session storage, updates login status,
   * redirects to the main page, and shows an error message if the backend fails.
   */
  async logout(): Promise<void> {
    try {
      await this.backend.logout();
      this.messageService.showSuccessMessage("You have been logged out successfully.", 3);

    } catch (error: any) {
      this.messageService.showErrorMessage("Logout failed on server, but local session cleared.", 5);
      console.error('Logout error:', error);

    } finally {
      sessionStorage.removeItem('user');
      this.isLoggedInSubject.next(false);
      this.router.navigate(['']);
    }
  }
}
