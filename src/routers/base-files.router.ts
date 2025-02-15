import createDebug from 'debug';
import { BaseRouter } from './base.router.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:base-files:router');

export abstract class BaseFilesRouter<T, C> extends BaseRouter<T, C> {
  constructor(
    controller: BaseRouter<T, C>['controller'],
    authInterceptor: BaseRouter<T, C>['authInterceptor'],
    protected readonly filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor);
    debug('Instantiated BaseFilesRouter');

    this.router.post('/',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      filesInterceptor.singleFile('image'),
      filesInterceptor.cloudinaryUpload.bind(filesInterceptor),
      controller.create.bind(controller)
    );

    this.router.patch('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      filesInterceptor.singleFile('image'),
      filesInterceptor.cloudinaryUpload.bind(filesInterceptor),
      controller.update.bind(controller)
    );
  }
}
