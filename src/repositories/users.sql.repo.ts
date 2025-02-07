import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type User, type UserUpdateDto, type UserCreateDto } from '../entities/user.js';
import { HttpError } from '../middlewares/errors.middleware.js';
import { type WithLoginRepo } from './type.repo.js';

const debug = createDebug('PIM:users:repo:sql');

const select = {
  id: true,
  name: true,
  email: true,
  password: true,
  role: true,
  approved: true,
  message: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  appointments: {
    select: {
      id: true,
      appointmentId: true,
      userId: true,
      createdAt: true,
      appointment: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
};

export class UsersSqlRepo implements WithLoginRepo<User, UserCreateDto> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated UsersSqlRepo')
  }

  async readAll() {
    return this.prisma.user.findMany({select});
  }

  async readById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select,
    });

    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);
    }

    return user;
  }

  async searchForLogin(key: 'email', value: string) {
    const user = await this.prisma.user.findFirst({
      where: { [key]: value },
      select: { id: true, email: true, password: true, role: true },
    });

    if(!user) throw new HttpError(404, 'Not Found', 'Invalid credentials');
    return user;
  }

  async create(data: UserCreateDto): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          role: 'GUEST',
          approved: false,
        },
        select,
      });
      return newUser;
    } catch (error: unknown) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  async update(id: string, data: Partial<UserUpdateDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select,
      });
    } catch (error: unknown) {
      throw new Error(`Failed to update user: ${(error as Error).message}`)
    }
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);
    }
    return this.prisma.user.delete({
      where: { id },
      select,
    });
  }
}
