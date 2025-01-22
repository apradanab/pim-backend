import { type AppointmentUser } from './appointment-user.js';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role: 'GUEST' | 'USER' | 'ADMIN';
  approved: boolean;
  message?: string | null;
  avatar?: string | null;
  appointments: AppointmentUser[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserCreateDto = {
  name: string;
  email: string;
  message: string;
};

export type UserUpdateDto = {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  approved?: boolean;
};
