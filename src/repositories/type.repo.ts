import { AppointmentUpdateDto } from "../entities/appointment.js";

export type Repo<T, C> = {
  readAll(): Promise<T[]>;
  readById(id: string): Promise<T>;
  create(data: C): Promise<T>;
  update(id:string, data: Partial<C>): Promise<T>;
  delete(id: string): Promise<T>;
};

export type WithLoginRepo<T, C> = Repo<T, C> & {
  searchForLogin(key: 'email', value: string): Promise<Partial<T>>;
};

export type WithAppointmentFeatures<T, C> = Repo<T, C> & {
  update(id: string, data: Partial<AppointmentUpdateDto>): Promise<T>;
  approveAppointment(id: string): Promise<T>;
  assignAppointmentToUser(appointmentId: string, userId: string): Promise<T>;
  approveCancellation(id: string, newStatus: 'AVAILABLE' | 'CANCELLED'): Promise<T>;
  completePastAppointments(): Promise<void>;
};
