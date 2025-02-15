import createDebug from 'debug';
import { BaseFilesRouter } from './base-files.router.js';
import { Resource, ResourceCreateDto } from '../entities/resource.js';
import { type ResourcesController } from '../controllers/resources.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:resources:router');

export class ResourcesRouter extends BaseFilesRouter<Resource, ResourceCreateDto>{
  constructor(
    readonly controller: ResourcesController,
    readonly authInterceptor: AuthInterceptor,
    readonly filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor, filesInterceptor);
    debug('Instantiated ResourcesRouter');
  }
}
