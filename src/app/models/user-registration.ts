export interface UserRegistration {
  username: string;
  password: string;
  repeatPassword: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  location: string;
  gender: 'man' | 'woman';
  age: number;
  interests: string[];
}
