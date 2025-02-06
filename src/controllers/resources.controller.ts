import createDebug from 'debug';
import { type Resource, type ResourceCreateDto } from '../entities/resource.js';
import { BaseController } from './base.controller.js';
import { type Repo } from '../repositories/type.repo.js';
import { resourceCreateDtoSchema, resourceUpdateDtoSchema } from '../entities/resource.schema.js';

const debug = createDebug('PIM:resources:controller');

export class ResourcesController extends BaseController<Resource, ResourceCreateDto> {
  constructor(protected readonly repo: Repo<Resource, ResourceCreateDto>) {
    super(repo, resourceCreateDtoSchema, resourceUpdateDtoSchema);
    debug('Instantiated ResourcesController');
  }
}
