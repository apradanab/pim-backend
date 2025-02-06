import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { type ResourcesController } from '../controllers/resources.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';

const debug = createDebug('PIM:resources:router');

export class ResourcesRouter {
  router = createRouter();

  constructor(
    readonly controller: ResourcesController,
    readonly authInterceptor: AuthInterceptor
  ) {
    debug('Instantiated ResourcesRouter');

    this.router.get('/', controller.getAll.bind(controller));

    this.router.get('/:id', controller.getById.bind(controller));

    this.router.post('/',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.create.bind(controller)
    );

    this.router.patch('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.update.bind(controller)
    );

    this.router.delete('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.delete.bind(controller)
    );
  }
}
