import { type AdvicesController } from '../controllers/advices.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { AdvicesRouter } from './advices.router';

describe('Given an instance of the class AdvicesRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as AdvicesController;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new AdvicesRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of the class AdvicesRouter', () => {
    expect(router).toBeInstanceOf(AdvicesRouter);
  });
});
