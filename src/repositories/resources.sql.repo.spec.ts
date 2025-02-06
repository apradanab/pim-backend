import { ResourcesSqlRepo } from './resources.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type ResourceCreateDto } from '../entities/resource';
import { type PrismaClient } from '@prisma/client';

const mockPrisma = {
  resource: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', title: 'Test Resource' }),
    create: jest.fn().mockResolvedValue({ id: '1', title: 'New Resource' }),
    update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Resource' }),
    delete: jest.fn().mockResolvedValue({ id: '1'}),
  },
} as unknown as PrismaClient;

describe('ResourceSqlRepo', () => {
  const repo = new ResourcesSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.resource.findMany and return resources', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.resource.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return a resource when th ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Test Resource' });
    });

    test('should throw a 404 error if the resource is not found', async () => {
      (mockPrisma.resource.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Resource 2 not found' )
      );
    });
  });

  describe('create', () => {
    test('should create a new resource with valid data', async () => {
      const data: ResourceCreateDto = {
        title: 'New Resource',
        description: 'Test',
        content: 'Test content',
        image: 'test.jpg',
        serviceId: '123',
      };
      const result = await repo.create(data);
      expect(mockPrisma.resource.create).toHaveBeenCalledWith({
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'New Resource' });
    });

    test('should throw an error if creation fails', async () => {
      (mockPrisma.resource.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      const data: ResourceCreateDto = {
        title: 'New Resource',
        description: 'Test',
        content: 'Test content',
        image: 'test.jpg',
        serviceId: '123',
      };
      await expect(repo.create(data)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update a resource with valid data', async () => {
      const data: Partial<ResourceCreateDto> = { title: 'Updated Resource' };
      const result = await repo.update('1', data);
      expect(mockPrisma.resource.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Updated Resource' });
    });

    test('should throw a 404 error if the resource is not found', async () => {
      (mockPrisma.resource.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { title: 'Updated Resource' })).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Resource 2 not found')
      );
    });

    test('should throw an error if update fails', async () => {
      const mockError = new Error('Database update failed');
      (mockPrisma.resource.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockPrisma.resource.update as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(repo.update('1', { title: 'Updated Resource' })).rejects.toThrow(
        'Database update failed'
      );
    });
  });

  describe('delete', () => {
    test('should delete a resource with a valid ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.resource.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1' });
    });

    test('should throw a 404 error if the resource is not found', async () => {
      (mockPrisma.resource.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Resource 2 not found')
      );
    });
  });
})
