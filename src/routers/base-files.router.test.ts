import { type BaseController } from '../controllers/base.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { BaseFilesRouter } from './base-files.router';

type MockEntity = { id: string; name: string };
type MockCreateDto = { name: string }; 

class TestFilesRouter extends BaseFilesRouter<MockEntity, MockCreateDto> {
  constructor(
    controller: BaseController<MockEntity, MockCreateDto>, 
    authInterceptor: AuthInterceptor,
    filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor, filesInterceptor);
  }
}

describe('Given an instance of the class BaseFilesRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseController<MockEntity, MockCreateDto>;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const filesInterceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new TestFilesRouter(controller, authInterceptor, filesInterceptor);

  test('Then it should be an instance of BaseFilesRouter', () => {
    expect(router).toBeInstanceOf(BaseFilesRouter);
  });
});
