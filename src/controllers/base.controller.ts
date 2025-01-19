import createDebug from 'debug';
import { type NextFunction, type Request, type Response } from 'express';
import { type Repo } from '../repositories/type.repo';
import type Joi from 'joi';

const debug = createDebug('PIM:base:controller');

export abstract class BaseController<T, C> {
  constructor(
    protected readonly repo: Repo<T, C>,
    protected readonly validateCreateDtoSchema: Joi.ObjectSchema<C>,
    protected readonly validateUpdateDtoSchema: Joi.ObjectSchema<Partial<C>>,
  ) {
    debug('Instantiated BaseController');
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.repo.readAll();
      res.json(result);
    } catch(error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await this.repo.readById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const data = req.body as C;
    const { error } = this.validateCreateDtoSchema.validate(data);
    
    if(error) {
      next(error);
      return;
    }

    try {
      const result = await this.repo.create(data);
      res.status(201).json(result);
    } catch(error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data = req.body as Partial<C>;
    const { error } = this.validateUpdateDtoSchema.validate(data);

    if(error) {
      next(error);
      return;
    }

    try {
      const result = await this.repo.update(id, data);
      res.json(result);
    } catch(error) {
      next(error);
    }
  }


  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.repo.delete(id);
      res.json(result);
    } catch(error) {
      next(error);
    }
  }
}
