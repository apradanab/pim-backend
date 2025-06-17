import createDebug from 'debug';
import { BaseFilesRouter } from './base-files.router.js';
import { Advice, AdviceCreateDto } from '../entities/advice.js';
import { type AdvicesController } from '../controllers/advices.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { type FilesInterceptor } from '../middlewares/files.interceptor.js';

const debug = createDebug('PIM:advices:router');

export class AdvicesRouter extends BaseFilesRouter<Advice, AdviceCreateDto>{
  constructor(
    readonly controller: AdvicesController,
    readonly authInterceptor: AuthInterceptor,
    readonly filesInterceptor: FilesInterceptor
  ) {
    super(controller, authInterceptor, filesInterceptor);
    debug('Instantiated AdvicesRouter');
  }
}
