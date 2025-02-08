import { type Service } from './service.js';
import { type AppointmentUser } from './appointment-user.js';

export type Appointment = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'OCCUPIED' | 'COMPLETED' | 'CANCELLED';
  serviceId: string;
  service?: Partial<Service>;
  cancellationReason?: string;
  users?: AppointmentUser[];
  createdAt: Date;
  updatedAt: Date;
};

export type AppointmentCreateDto = {
  date: Date;
  startTime: Date;
  endTime: Date;
  serviceId: string;
};

export type AppointmentUpdateDto = {
  status?: 'PENDING' | 'OCCUPIED' | 'COMPLETED' | 'CANCELLED';
  cancellationReason?: string;
};
