import createDebug from 'debug';
import { BaseRouter } from './base.router.js';
import { Service, ServiceCreateDto } from '../entities/service.js';
import { type ServicesController } from '../controllers/services.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';

const debug = createDebug('PIM:services:router');

export class ServicesRouter extends BaseRouter<Service, ServiceCreateDto> {
  constructor(
    readonly controller: ServicesController,
    readonly authInterceptor: AuthInterceptor
  ) {
    super(controller, authInterceptor);
    debug('Instantiated ServicesRouter');
  }
}
