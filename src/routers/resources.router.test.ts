import { type ResourcesController } from '../controllers/resources.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { ResourcesRouter } from './resources.router';

describe('Given an instance of the class ResourcesRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as ResourcesController;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new ResourcesRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of the class ResourcesRouter', () => {
    expect(router).toBeInstanceOf(ResourcesRouter);
  });
});
