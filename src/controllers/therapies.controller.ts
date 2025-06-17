import createDebug from 'debug';
import { type Therapy, type TherapyCreateDto } from '../entities/therapy.js';
import { BaseController } from './base.controller.js';
import { type Repo } from '../repositories/type.repo.js';
import { therapyCreateDtoSchema, therapyUpdateDtoSchema } from '../entities/therapy.schema.js';

const debug = createDebug('PIM:therapies:controller');

export class TherapiesController extends BaseController<Therapy, TherapyCreateDto> {
  constructor(protected readonly repo: Repo<Therapy, TherapyCreateDto>) {
    super(repo, therapyCreateDtoSchema, therapyUpdateDtoSchema);
    debug('Instantiated TherapiesController');
  }
}
