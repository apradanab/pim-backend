import { type Service } from './service.js';
import { type AppointmentUser } from './appointment-user.js';

export type Appointment = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: 'AVAILABLE' | 'PENDING' | 'OCCUPIED' | 'COMPLETED' | 'CANCELLED';
  serviceId: string;
  service?: Partial<Service>;
  notes?: string | null;
  AdminNotes?: string;
  users?: AppointmentUser[];
  createdAt: Date;
  updatedAt: Date;
};

export type AppointmentCreateDto = {
  date: Date;
  startTime: Date;
  endTime: Date;
  serviceId: string;
  notes?: string;
};

export type AppointmentUpdateDto = Partial<AppointmentCreateDto> & {
  status?: 'PENDING' | 'OCCUPIED' | 'COMPLETED' | 'CANCELLED';
  cancellationReason?: string;
};
