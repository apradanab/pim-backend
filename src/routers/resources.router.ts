import createDebug from 'debug';
import { BaseRouter } from './base.router.js';
import { Resource, ResourceCreateDto } from '../entities/resource.js';
import { type ResourcesController } from '../controllers/resources.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';

const debug = createDebug('PIM:resources:router');

export class ResourcesRouter extends BaseRouter<Resource, ResourceCreateDto>{
  constructor(
    readonly controller: ResourcesController,
    readonly authInterceptor: AuthInterceptor
  ) {
    super(controller, authInterceptor);
    debug('Instantiated ResourcesRouter');
  }
}
