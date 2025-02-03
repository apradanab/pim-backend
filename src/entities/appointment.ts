import { type Service } from './service.js';
import { type AppointmentUser } from './appointment-user.js';

export type Appointment = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'OCCUPIED' | 'COMPLETED' | 'CANCELLED';
  serviceId: string;
  service?: Service;
  cancellationReason?: string;
  users?: AppointmentUser[];
  createdAt: Date;
  updatedAt: Date;
};
