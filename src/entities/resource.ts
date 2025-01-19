import { type Service } from './service.js';

export type Resource = {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  serviceId: string;
  service: Service;
  createdAt: Date;
  updatedAt: Date;
};
