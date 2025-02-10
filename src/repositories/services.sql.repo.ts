import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type Repo } from './type.repo.js';
import { type ServiceCreateDto, type Service } from '../entities/service.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:services:repo:sql');

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
      serviceId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  resources: {
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      image: true,
      serviceId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

export class ServicesSqlRepo implements Repo<Service, Partial<Service>> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated ServicesSqlRepo');
  }

  async readAll(): Promise<Service[]> {
    return this.prisma.service.findMany({ select });
  }

  async readById(id: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select,
    });

    if(!service) {
      throw new HttpError(404, 'Not Found', `Service ${id} not found`);
    }

    return service;
  }

  async create(data: ServiceCreateDto): Promise<Service> {
    return this.prisma.service.create({
      data,
      select,
    }); 
  }

  async update(id: string, data: Partial<ServiceCreateDto>): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select,
    });

    if(!service) {
      throw new HttpError(404, 'Not Found', `Service ${id} not found`);
    }

    return this.prisma.service.update({
      where: { id },
      data,
      select,
    });
  }

  async delete(id: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select,
    });

    if(!service) {
      throw new HttpError(404, 'Not Found', `Service ${id} not found`);
    }

    return this.prisma.service.delete({
      where: { id },
      select,
    });
  }
}
