import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { type FilesController } from '../controllers/files.controller.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:files:router');

export class FilesRouter {
  router = createRouter();

  constructor(
    readonly controller: FilesController,
    readonly interceptor: FilesInterceptor
  ) {
    debug('Instantiated FilesRouter');

    this.router.post(
      '/avatar',
      interceptor.singleFile('avatar').bind(interceptor),
      interceptor.cloudinaryUpload.bind(interceptor),
      controller.fileHandler.bind(controller)
    );

    this.router.post(
      '/image',
      interceptor.singleFile('image').bind(interceptor),
      interceptor.cloudinaryUpload.bind(interceptor),
      controller.fileHandler.bind(controller)
    );
  }
}
