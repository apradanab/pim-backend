import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { UsersController } from '../controllers/users.controller.js';

const debug = createDebug('PIM:users:router')

export class UsersRouter {
  router = createRouter();

  constructor( readonly controller: UsersController ) {
    debug('Instatiated users router');

    this.router.get('/',controller.getAll.bind(controller));
  }
}
