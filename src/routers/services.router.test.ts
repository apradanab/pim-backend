import { type ServicesController } from '../controllers/services.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
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

  const router = new ServicesRouter(controller, authInterceptor);

  test('Then it should be an instance of the class ServicesRouter', () => {
    expect(router).toBeInstanceOf(ServicesRouter);
  });
});
