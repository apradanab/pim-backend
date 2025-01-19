import { type Resource } from './resource.js';
import { type Appointment } from './appointment.js';

export type Service = {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  resources: Resource[];
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
};
