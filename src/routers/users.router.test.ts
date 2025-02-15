import { type UsersController } from '../controllers/users.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { UsersRouter } from './users.router';


describe('Given an instance of the class UsersRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    login: jest.fn(),
    approveUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validateRegistration: jest.fn(),
    replyToGuest: jest.fn(),
  } as unknown as UsersController;
  
  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
    validateRegistrationToken: jest.fn(),
  } as unknown as AuthInterceptor

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new UsersRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of the class UsersRouter', () => {
    expect(router).toBeInstanceOf(UsersRouter);
  });
});
