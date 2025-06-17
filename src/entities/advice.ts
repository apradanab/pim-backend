import { type Therapy } from './therapy.js';

export type Advice = {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  therapyId: string;
  therapy?: Therapy;
  createdAt: Date;
  updatedAt: Date;
};

export type AdviceCreateDto = {
  title: string;
  description: string;
  content: string;
  image: string;
  therapyId: string;
};
