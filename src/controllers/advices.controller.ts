import createDebug from 'debug';
import { type Advice, type AdviceCreateDto } from '../entities/advice.js';
import { BaseController } from './base.controller.js';
import { type Repo } from '../repositories/type.repo.js';
import { adviceCreateDtoSchema, adviceUpdateDtoSchema } from '../entities/advice.schema.js';

const debug = createDebug('PIM:advices:controller');

export class AdvicesController extends BaseController<Advice, AdviceCreateDto> {
  constructor(protected readonly repo: Repo<Advice, AdviceCreateDto>) {
    super(repo, adviceCreateDtoSchema, adviceUpdateDtoSchema);
    debug('Instantiated AdvicesController');
  }
}
