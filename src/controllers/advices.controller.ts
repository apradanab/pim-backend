import createDebug from 'debug';
import { type Advice, type AdviceCreateDto } from '../entities/advice.js';
import { BaseController } from './base.controller.js';
import { type WithTherapyAdvices } from '../repositories/type.repo.js';
import { adviceCreateDtoSchema, adviceUpdateDtoSchema } from '../entities/advice.schema.js';
import { NextFunction, Request, Response } from 'express';

const debug = createDebug('PIM:advices:controller');

export class AdvicesController extends BaseController<Advice, AdviceCreateDto> {
  constructor(protected readonly repo: WithTherapyAdvices<Advice, AdviceCreateDto>) {
    super(repo, adviceCreateDtoSchema, adviceUpdateDtoSchema);
    debug('Instantiated AdvicesController');
  }

  async getByTherapyId(req: Request, res: Response, next: NextFunction) {
    const { therapyId } = req.params;
    try {
      const result = await this.repo.readByTherapyId(therapyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
