import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type Repo } from './type.repo.js';
import { type TherapyCreateDto, type Therapy } from '../entities/therapy.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:therapies:repo:sql');

const select = {
  id: true,
  title: true,
  description: true,
  content: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  appointments: {
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      therapyId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  advices: {
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      image: true,
      therapyId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

export class TherapiesSqlRepo implements Repo<Therapy, Partial<Therapy>> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated TherapiesSqlRepo');
  }

  async readAll(): Promise<Therapy[]> {
    return this.prisma.therapy.findMany({ select });
  }

  async readById(id: string): Promise<Therapy> {
    const therapy = await this.prisma.therapy.findUnique({
      where: { id },
      select,
    });

    if(!therapy) {
      throw new HttpError(404, 'Not Found', `Therapy ${id} not found`);
    }

    return therapy;
  }

  async create(data: TherapyCreateDto): Promise<Therapy> {
    return this.prisma.therapy.create({
      data,
      select,
    }); 
  }

  async update(id: string, data: Partial<TherapyCreateDto>): Promise<Therapy> {
    const therapy = await this.prisma.therapy.findUnique({
      where: { id },
      select,
    });

    if(!therapy) {
      throw new HttpError(404, 'Not Found', `Therapy ${id} not found`);
    }

    return this.prisma.therapy.update({
      where: { id },
      data,
      select,
    });
  }

  async delete(id: string): Promise<Therapy> {
    const therapy = await this.prisma.therapy.findUnique({
      where: { id },
      select,
    });

    if(!therapy) {
      throw new HttpError(404, 'Not Found', `Therapy ${id} not found`);
    }

    return this.prisma.therapy.delete({
      where: { id },
      select,
    });
  }
}
