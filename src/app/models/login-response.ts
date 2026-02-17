export interface LoginResponse {
  message: string;
  user: {
    userId: string;
    username: string;
    isAdmin: boolean;
  };
}
