import { type Request, type Response } from 'express';
import { BaseController } from './base.controller';
import { type Repo } from '../repositories/type.repo';
import { type ObjectSchema } from 'joi';

type TestModel = Record<string, unknown>;
type TestCreateDto = Record<string, unknown>;

const testCreateDtoSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} }),
} as unknown as ObjectSchema<TestCreateDto>;
const testUpdateDtoSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} }),
} as unknown as ObjectSchema<Partial<TestCreateDto>>;

class TestController extends BaseController<TestModel, TestCreateDto> {
  constructor(protected readonly repo: Repo<TestModel, TestCreateDto>) {
    super(repo, testCreateDtoSchema, testUpdateDtoSchema);
  }
}

describe('BaseController', () => {
  const repo = {
    readAll: jest.fn(),
    readById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as Repo<TestModel, TestCreateDto>;

  const req = {} as unknown as Request;
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn();
  const controller = new TestController(repo);

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('Should create an instance of TestController', () => {
    expect(controller).toBeInstanceOf(TestController);
  });

  describe('getAll method', () => {
    test('should call repo.readAll and return data', async () => {
      (repo.readAll as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test' }]);
      await controller.getAll(req, res, next);
      expect(repo.readAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([{ id: '1', name: 'Test' }]);
    });

    test('should handle errors and call next', async () => {
      const error = new Error('Error in getAll');
      (repo.readAll as jest.Mock).mockRejectedValue(error);
      await controller.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById method', () => {
    test('should call repo.readById and return data', async () => {
      req.params = { id: '1' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1', name: 'Test'});
      await controller.getById(req, res, next);
      expect(repo.readById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Test' });
    });

    test('should handle errors and call next', async () => {
      const error = new Error('Error in getById');
      req.params = { id: '1' };
      (repo.readById as jest.Mock).mockRejectedValue(error);
      await controller.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create method', () => {
    test('should exclude payload, call repo.create and return data', async () => {
      req.body = { name: 'Test', payload: 'should be removed' };
      (repo.create as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      await controller.create(req, res, next);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Test' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Test' });
    });

    test('should validate input and handle errors', async () => {
      req.body = { invalidField: 'Invalid' };
      (testCreateDtoSchema.validate as jest.Mock).mockReturnValue({ error: new Error('Validation error') });
      await controller.create(req, res, next);
      expect(testCreateDtoSchema.validate).toHaveBeenCalledWith({ invalidField: 'Invalid' });
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(new Error('Validation error'));
    });

    test('should handle repo.create errors and call next', async () => {
      req.body = { name: 'Test' };
      (testCreateDtoSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      const error = new Error('Repo create error');
      (repo.create as jest.Mock).mockRejectedValue(error);
      await controller.create(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update method', () => {
    test('should exclude payload, call repo.update and return data', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated Test', payload: 'should be removed' };
      (repo.update as jest.Mock).mockResolvedValue({ id: '1', name: 'Updated Test' });
      await controller.update(req, res, next);
      expect(repo.update).toHaveBeenCalledWith('1', { name: 'Updated Test' });
      expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Updated Test' });
    });

    test('should handle repo.update errors and call next', async () => {
      const error = new Error('Error in update');
      req.params = { id: '1' };
      req.body = { name: 'Updated Test' };
      (repo.update as jest.Mock).mockRejectedValue(error);
      await controller.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('should handle validation errors in update and call next', async () => {
      const validationError = new Error('Validation failed');
      (testUpdateDtoSchema.validate as jest.Mock).mockReturnValue({ error: validationError, value: null });
      req.params = { id: '1' };
      req.body = { invalidField: 'Invalid' };
      await controller.update(req, res, next);
      expect(testUpdateDtoSchema.validate).toHaveBeenCalledWith({ invalidField: 'Invalid' });
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(validationError);
    });
  });

  describe('delete method', () => {
    test('should call repo.delete and return success message', async () => {
      req.params = { id: '1' };
      (repo.delete as jest.Mock).mockResolvedValue({});
      await controller.delete(req, res, next);
      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({});
    });

    test('should handle errors and call next', async () => {
      const error = new Error('Error in delete');
      req.params = { id: '1' };
      (repo.delete as jest.Mock).mockRejectedValue(error);
      await controller.delete(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
