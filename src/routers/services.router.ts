import createDebug from 'debug';
import { BaseFilesRouter } from './base-files.router.js';
import { Service, ServiceCreateDto } from '../entities/service.js';
import { type ServicesController } from '../controllers/services.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:services:router');

export class ServicesRouter extends BaseFilesRouter<Service, ServiceCreateDto> {
  constructor(
    readonly controller: ServicesController,
    readonly authInterceptor: AuthInterceptor,
    readonly filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor, filesInterceptor);
    debug('Instantiated ServicesRouter');
  }
}
