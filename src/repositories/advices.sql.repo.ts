import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type WithTherapyAdvices, type Repo } from './type.repo.js';
import { AdviceCreateDto, type Advice } from '../entities/advice.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:advices:repo:sql');

const select = {
  id: true,
  title: true,
  description: true,
  content: true,
  image: true,
  therapyId: true,
  createdAt: true,
  updatedAt: true,
}

export class AdvicesSqlRepo implements WithTherapyAdvices<Advice, AdviceCreateDto> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated AdvicesSqlRepo');
  }

  async readAll(): Promise<Advice[]> {
    return this.prisma.advice.findMany({ select });
  }

  async readById(id: string): Promise<Advice> {
    const advice = await this.prisma.advice.findUnique({
      where: { id },
      select,
    });

    if(!advice) {
      throw new HttpError(404, 'Not Found', `Advice ${id} not found`);
    }

    return advice;
  }

  async readByTherapyId(therapyId: string): Promise<Advice[]> {
    const advices = await this.prisma.advice.findMany({
      where: { therapyId },
      select,
    });

    if (!advices) {
      throw new HttpError(404, 'Not Found', `No advices found for therapy ${therapyId}`)
    }

    return advices;
  }

  async create(data: AdviceCreateDto): Promise<Advice> {
    return this.prisma.advice.create({
      data,
      select,
    });
  }

  async update(id: string, data: Partial<AdviceCreateDto>): Promise<Advice> {
    const advice = await this.prisma.advice.findUnique({
      where: { id },
      select,
    });

    if(!advice) {
      throw new HttpError(404, 'Not Found', `Advice ${id} not found`);
    }

    return this.prisma.advice.update({
      where: { id },
      data,
      select,
    });
  }

  async delete(id: string): Promise<Advice> {
    const advice = await this.prisma.advice.findUnique({
      where: { id },
      select,
    });

    if(!advice) {
      throw new HttpError(404, 'Not Found', `Advice ${id} not found`);
    }

    return this.prisma.advice.delete({
      where: { id },
      select,
    });
  }
}
