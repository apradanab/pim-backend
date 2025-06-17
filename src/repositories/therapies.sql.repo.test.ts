import { TherapiesSqlRepo } from './therapies.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type TherapyCreateDto } from '../entities/therapy';
import { type PrismaClient } from '@prisma/client';

const mockPrisma = {
  therapy: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', title: 'Test Therapy' }),
    create: jest.fn().mockResolvedValue({ id: '1', title: 'New Therapy' }),
    update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Therapy' }),
    delete: jest.fn().mockResolvedValue({ id: '1' }),
  },
} as unknown as PrismaClient;

describe('TherapiesSqlRepo', () => {
  const repo = new TherapiesSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.therapy.findMany and return therapies', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.therapy.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return a therapy when the ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.therapy.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', title: 'Test Therapy' });
    });

    test('should throw a 404 error if the therapy is not found', async () => {
      (mockPrisma.therapy.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Therapy 2 not found')
      );
    });
  });

  describe('create', () => {
    test('should create a new therapy with valid data', async () => {
      const data: TherapyCreateDto = { title: 'New Therapy', description: 'Test', content: 'Test content', image: 'test.jpg' };
      const result = await repo.create(data);
      expect(mockPrisma.therapy.create).toHaveBeenCalledWith({
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'New Therapy' });
    });

    test('should throw an error if creation fails ', async () => {
      (mockPrisma.therapy.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      const data: TherapyCreateDto = { title: 'New Therapy', description: 'Test', content: 'Test content', image: 'test.jpg' };
      await expect(repo.create(data)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    test('should update a therapy with valid data', async () => {
      const data: Partial<TherapyCreateDto> = { title: 'Updated Therapy' };
      const result = await repo.update('1', data);
      expect(mockPrisma.therapy.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data,
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', title: 'Updated Therapy' });
    });

    test('should throw a 404 error if the therapy is not found', async () => {
      (mockPrisma.therapy.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { title: 'Updated Therapy' })).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Therapy 2 not found')
      );
    });

    test('should throw an error if update fails', async () => {
      const mockError = new Error('Database update failed');
      (mockPrisma.therapy.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockPrisma.therapy.update as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(repo.update('1', { title: 'Updated Therapy' })).rejects.toThrow(
        'Database update failed'
      );
    });
  });

  describe('delete', () => {
    test('should delete a therapy with a valid ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.therapy.delete).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1' });
    });

    test('should throw a 404 error if the therapy is not found', async () => {
      (mockPrisma.therapy.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Therapy 2 not found')
      );
    });
  });
});
