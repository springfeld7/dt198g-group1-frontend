import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Interest } from '../models/interest';

@Injectable({
  providedIn: 'root',
})
export class BackendServiceService {
  private API_URL: string = 'http://localhost:3000/api/v1';

  constructor() {}

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

  async registerUser(user: any): Promise<any> {
    try {
      // Send POST request to backend to log the user in
      const response = await fetch(`${this.API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include"
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

  async loginUser(username: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg.error);
      }

      const userData = await response.json();

      localStorage.setItem("user", JSON.stringify(userData.user));

      return userData;
    } catch (error: any) {
      throw error;
    }
  }
}
