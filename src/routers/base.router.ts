import createDebug from 'debug';
import { Router as createRouter } from 'express';
import { type BaseController } from '../controllers/base.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';

const debug = createDebug('PIM:base:router');

export abstract class BaseRouter<T, C> {
  router = createRouter();

  constructor(
    protected readonly controller: BaseController<T, C>,
    protected readonly authInterceptor: AuthInterceptor
  ) {
    debug('Instantiated BaseRouter');

    this.router.get('/', this.controller.getAll.bind(this.controller));

    this.router.get('/:id', this.controller.getById.bind(this.controller));

    this.router.post('/',
      this.authInterceptor.authentication.bind(this.authInterceptor),
      this.authInterceptor.isAdmin.bind(this.authInterceptor),
      this.controller.create.bind(this.controller)
    );

    this.router.patch('/:id',
      this.authInterceptor.authentication.bind(this.authInterceptor),
      this.authInterceptor.isAdmin.bind(this.authInterceptor),
      this.controller.update.bind(this.controller)
    );

    this.router.delete('/:id',
      this.authInterceptor.authentication.bind(this.authInterceptor),
      this.authInterceptor.isAdmin.bind(this.authInterceptor),
      this.controller.delete.bind(this.controller)
    );
  }
}
