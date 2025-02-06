import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type Repo } from './type.repo.js';
import { ResourceCreateDto, type Resource } from '../entities/resource.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:resources:repo');

const select = {
  id: true,
  title: true,
  description: true,
  content: true,
  image: true,
  serviceId: true,
  createdAt: true,
  updatedAt: true,
}

export class ResourcesSqlRepo implements Repo<Resource, Partial<Resource>> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated ResourcesSqlRepo');
  }

  async readAll(): Promise<Resource[]> {
    return this.prisma.resource.findMany({ select });
  }

  async readById(id: string): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      select,
    });

    if(!resource) {
      throw new HttpError(404, 'Not Found', `Resource ${id} not found`);
    }

    return resource;
  }

  async create(data: ResourceCreateDto): Promise<Resource> {
    return this.prisma.resource.create({
      data,
      select,
    });
  }

  async update(id: string, data: Partial<ResourceCreateDto>): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      select,
    });

    if(!resource) {
      throw new HttpError(404, 'Not Found', `Resource ${id} not found`);
    }

    return this.prisma.resource.update({
      where: { id },
      data,
      select,
    });
  }

  async delete(id: string): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      select,
    });

    if(!resource) {
      throw new HttpError(404, 'Not Found', `Resource ${id} not found`);
    }

    return this.prisma.resource.delete({
      where: { id },
      select,
    });
  }
}
