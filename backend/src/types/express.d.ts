import { UserRole } from '../models/User';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      full_name: string;
      role: UserRole;
      auth_provider?: string;
      google_id?: string;
    }
  }
}

export {};
