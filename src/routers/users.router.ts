import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { type UsersController } from '../controllers/users.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:users:router')

export class UsersRouter {
  router = createRouter();

  constructor( 
    readonly controller: UsersController, 
    readonly authInterceptor: AuthInterceptor,
    readonly filesInterceptor: FilesInterceptor
  ) {
    debug('Instantiated UsersRouter');

    this.router.post('/create', controller.create.bind(controller));

    this.router.post('/login', controller.login.bind(controller));

    this.router.get('/',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.getAll.bind(controller)
    );

    this.router.get('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.getById.bind(controller)
    );

    this.router.patch('/approve/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.approveUser.bind(controller)
    );

    this.router.post('/reply/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.replyToGuest.bind(controller)
    );

    this.router.post('/validate-registration',
      authInterceptor.validateRegistrationToken.bind(authInterceptor),
      controller.validateRegistration.bind(controller)
    );

    this.router.patch('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      filesInterceptor.singleFile('avatar'),
      filesInterceptor.cloudinaryUpload.bind(filesInterceptor),
      controller.update.bind(controller)
    );

    this.router.delete('/:id',
      authInterceptor.authentication.bind(authInterceptor),
      controller.delete.bind(controller)
    );
  }
}
