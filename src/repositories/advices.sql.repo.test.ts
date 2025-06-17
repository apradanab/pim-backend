import { AdvicesSqlRepo } from './advices.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type AdviceCreateDto } from '../entities/advice';
import { type PrismaClient } from '@prisma/client';

const mockPrisma = {
  advice: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', title: 'Test Advice' }),
    create: jest.fn().mockResolvedValue({ id: '1', title: 'New Advice' }),
    update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Advice' }),
    delete: jest.fn().mockResolvedValue({ id: '1'}),
  },
} as unknown as PrismaClient;

describe('AdvicesSqlRepo', () => {
  const repo = new AdvicesSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.advice.findMany and return advices', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.advice.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return a advice when th ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.advice.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Test Advice' });
    });

    test('should throw a 404 error if the advice is not found', async () => {
      (mockPrisma.advice.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Advice 2 not found' )
      );
    });
  });

  describe('create', () => {
    test('should create a new advice with valid data', async () => {
      const data: AdviceCreateDto = {
        title: 'New Advice',
        description: 'Test',
        content: 'Test content',
        image: 'test.jpg',
        therapyId: '123',
      };
      const result = await repo.create(data);
      expect(mockPrisma.advice.create).toHaveBeenCalledWith({
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'New Advice' });
    });

    test('should throw an error if creation fails', async () => {
      (mockPrisma.advice.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      const data: AdviceCreateDto = {
        title: 'New Advice',
        description: 'Test',
        content: 'Test content',
        image: 'test.jpg',
        therapyId: '123',
      };
      await expect(repo.create(data)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update a advice with valid data', async () => {
      const data: Partial<AdviceCreateDto> = { title: 'Updated Advice' };
      const result = await repo.update('1', data);
      expect(mockPrisma.advice.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Updated Advice' });
    });

    test('should throw a 404 error if the advice is not found', async () => {
      (mockPrisma.advice.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { title: 'Updated Advice' })).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Advice 2 not found')
      );
    });

    test('should throw an error if update fails', async () => {
      const mockError = new Error('Database update failed');
      (mockPrisma.advice.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockPrisma.advice.update as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(repo.update('1', { title: 'Updated Advice' })).rejects.toThrow(
        'Database update failed'
      );
    });
  });

  describe('delete', () => {
    test('should delete a advice with a valid ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.advice.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1' });
    });

    test('should throw a 404 error if the advice is not found', async () => {
      (mockPrisma.advice.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Advice 2 not found')
      );
    });
  });
})
