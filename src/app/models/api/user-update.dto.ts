import { UserRegistration } from './user-registration.dto';

export interface UserUpdateData extends Partial<UserRegistration> {
    // All fields from UserRegistration (including passwords) are now optional
}
