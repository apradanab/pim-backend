import { type Advice } from './advice.js';
import { type Appointment } from './appointment.js';

export type Therapy = {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  resources?: Advice[];
  appointments?: Appointment[];
  createdAt: Date;
  updatedAt: Date;
};

export type TherapyCreateDto = {
  title: string;
  description: string;
  content: string;
  image: string;
};
