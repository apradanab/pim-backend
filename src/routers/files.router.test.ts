import { type FilesController } from '../controllers/files.controller';
import { type FilesInterceptor } from '../middlewares/files.interceptor';
import { FilesRouter } from './files.router';

describe('Given an instance of the class FilesRouter', () => {
  const controller = {
    fileHandler: jest.fn(),
  } as unknown as FilesController;

  const interceptor: FilesInterceptor = {
    singleFile: jest.fn().mockReturnValue(jest.fn()),
    cloudinaryUpload: jest.fn(),
  } as unknown as FilesInterceptor;

  const router = new FilesRouter(controller, interceptor);

  test('Then it should be an instance of FilesRouter', () => {
    expect(router).toBeInstanceOf(FilesRouter);
  });
});
