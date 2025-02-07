import createDebug from 'debug';
import { type Service, type ServiceCreateDto } from '../entities/service.js';
import { BaseController } from './base.controller.js';
import { type Repo } from '../repositories/type.repo.js';
import { serviceCreateDtoSchema, serviceUpdateDtoSchema } from '../entities/service.schema.js';

const debug = createDebug('PIM:services:controller');

export class ServicesController extends BaseController<Service, ServiceCreateDto> {
  constructor(protected readonly repo: Repo<Service, ServiceCreateDto>) {
    super(repo, serviceCreateDtoSchema, serviceUpdateDtoSchema);
    debug('Instantiated ServicesController');
  }
}
