export type Advice = {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  therapyId: string;
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
