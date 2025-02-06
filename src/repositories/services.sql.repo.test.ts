import { ServicesSqlRepo } from './services.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type ServiceCreateDto } from '../entities/service';
import { type PrismaClient } from '@prisma/client';

const mockPrisma = {
  service: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', title: 'Test Service' }),
    create: jest.fn().mockResolvedValue({ id: '1', title: 'New Service' }),
    update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Service' }),
    delete: jest.fn().mockResolvedValue({ id: '1' }),
  },
} as unknown as PrismaClient;

describe('ServicesSqlRepo', () => {
  const repo = new ServicesSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.service.findMany and return services', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.service.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return a service when the ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', title: 'Test Service' });
    });

    test('should throw a 404 error if the service is not found', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Service 2 not found')
      );
    });
  });

  describe('create', () => {
    test('should create a new service with valid data', async () => {
      const data: ServiceCreateDto = { title: 'New Service', description: 'Test', content: 'Test content', image: 'test.jpg' };
      const result = await repo.create(data);
      expect(mockPrisma.service.create).toHaveBeenCalledWith({
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'New Service' });
    });

    test('should throw an error if creation fails ', async () => {
      (mockPrisma.service.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      const data: ServiceCreateDto = { title: 'New Service', description: 'Test', content: 'Test content', image: 'test.jpg' };
      await expect(repo.create(data)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update a service with valid data', async () => {
      const data: Partial<ServiceCreateDto> = { title: 'Updated Service' };
      const result = await repo.update('1', data);
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Updated Service' });
    });

    test('should throw a 404 error if the service is not found', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { title: 'Updated Service' })).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Service 2 not found')
      );
    });

    test('should throw an error if update fails', async () => {
      const mockError = new Error('Database update failed');
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockPrisma.service.update as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(repo.update('1', { title: 'Updated Service' })).rejects.toThrow(
        'Database update failed'
      );
    });
  });

  describe('delete', () => {
    test('should delete a service with a valid ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.service.delete).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1' });
    });

    test('should throw a 404 error if the service is not found', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Service 2 not found')
      );
    });
  });
});
