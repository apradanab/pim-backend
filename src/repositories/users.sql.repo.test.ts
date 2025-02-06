import { UsersSqlRepo } from './users.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type UserCreateDto, type UserUpdateDto } from '../entities/user';
import { type PrismaClient } from '@prisma/client';

const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' }),
    findFirst: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com'}),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated User' }),
    delete: jest.fn().mockResolvedValue({ id: '1' }),
  },
} as unknown as PrismaClient;

describe('UsersSqlRepo', () => {
  const repo = new UsersSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.findMany and return users', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return a user when the ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', name: 'Test User' });
    });

    test('should throw a 404 error if the user in not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found'));
    });
  });

  describe('searchForLogin', () => {
    test('should return a user for valid credentials', async () => {
      const result = await repo.searchForLogin('email', 'test@example.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@example.com' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });

    test('should throw a 404 error for invalid credentials', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.searchForLogin('email', 'invalid@example.com')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Invalid credentials'));
    });
  });

  describe('create', () => {
    test('should create a new user with valid data', async () => {
      const data: UserCreateDto = { name: 'New User', email: 'newuser@example.com', message: 'Test message' };
      const result = await repo.create(data);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { ...data, role: 'GUEST', approved:false },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', name: 'Test User' });
    });

    test('should throw an error if creation fails', async () => {
      (mockPrisma.user.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      const data: UserCreateDto = { name: 'New User', email: 'newuser@example.com', message: 'Test message' };
      await expect(repo.create(data)).rejects.toThrow('Failed to create user: Database error');
    });
  });

  describe('update', () => {
    test('should update a user with valid data', async () => {
      const data: Partial<UserUpdateDto> = { name: 'Updated User' };
      const result = await repo.update('1', data);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data, 
        select: expect.any(Object) 
      });
      expect(result).toEqual({ id: '1', name: 'Updated User' }); 
    });
    
    test('should throw a 404 error if the user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { name: 'Updated User' })).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found'));
    });

    test('should throw an error if prisma.user.update fails', async () => {
      const mockError = new Error('Database update failed');
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockPrisma.user.update as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(repo.update('1', { name: 'Updated User' })).rejects.toThrow(
        'Failed to update user: Database update failed'
      );
    })
  });

  describe('delete', () => {
    test('should delete a user with a salid ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: '1'}, select: expect.any(Object) });
      expect(result).toEqual({ id: '1' });
    });

    test('should throw a 404 error if the user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found'));
    });
  });
});
