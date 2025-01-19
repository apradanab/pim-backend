import { type Appointment } from "./appointment.js";
import { type User } from "./user.js";

export type AppointmentUser = {
  id: string;
  appointmentId: string;
  userId: string;
  createdAt: Date;
  appointment: Partial<Appointment>;
  user: Partial<User>;
};
