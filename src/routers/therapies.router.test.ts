import { type TherapiesController } from '../controllers/therapies.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { TherapiesRouter } from './therapies.router';

describe('Given an instance of the class TherapiesRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as TherapiesController;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new TherapiesRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of the class TherapiesRouter', () => {
    expect(router).toBeInstanceOf(TherapiesRouter);
  });
});
