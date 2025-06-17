import { TherapiesController } from './therapies.controller';
import { type Repo } from '../repositories/type.repo';
import { type Therapy, type TherapyCreateDto } from '../entities/therapy';
import { therapyCreateDtoSchema, therapyUpdateDtoSchema } from '../entities/therapy.schema';

describe('Given an instance of the TherapiesController class', () => {
  const repo: Repo<Therapy, TherapyCreateDto> = {} as unknown as Repo<Therapy, TherapyCreateDto>;
  const controller = new TherapiesController(repo);

  test('Should be an instance of the TherapiesController class', () => {
    expect(controller).toBeInstanceOf(TherapiesController);
  });

  test('Should inherit from BaseController and have schema validation', () => {
    expect(controller).toHaveProperty('validateCreateDtoSchema', therapyCreateDtoSchema);
    expect(controller).toHaveProperty('validateUpdateDtoSchema', therapyUpdateDtoSchema);
  });
});
