import { User } from './user';

export interface AuthenticatedSession {
  user: User;
  token: string;
}