import { type ServicesController } from '../controllers/services.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { ServicesRouter } from './services.router';

describe('Given an instance of the class ServicesRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as ServicesController;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new ServicesRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of the class ServicesRouter', () => {
    expect(router).toBeInstanceOf(ServicesRouter);
  });
});
