import createDebug from 'debug';
import { BaseFilesRouter } from './base-files.router.js';
import { Therapy, TherapyCreateDto } from '../entities/therapy.js';
import { type TherapiesController } from '../controllers/therapies.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:therapies:router');

export class TherapiesRouter extends BaseFilesRouter<Therapy, TherapyCreateDto> {
  constructor(
    readonly controller: TherapiesController,
    readonly authInterceptor: AuthInterceptor,
    readonly filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor, filesInterceptor);
    debug('Instantiated TherapiesRouter');
  }
}
