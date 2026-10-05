import { Role } from '../enums/role.enum';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}