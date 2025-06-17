import { AdvicesController } from './advices.controller';
import { type Repo } from '../repositories/type.repo';
import { type Advice, type AdviceCreateDto } from '../entities/advice';
import { adviceCreateDtoSchema, adviceUpdateDtoSchema } from '../entities/advice.schema';

describe('Given an instance of the AdvicesController class', () => {
  const repo: Repo<Advice, AdviceCreateDto> = {} as unknown as Repo<Advice, AdviceCreateDto>;
  const controller = new AdvicesController(repo);

  test('Should be an instance of the AdvicesController class', () => {
    expect(controller).toBeInstanceOf(AdvicesController);
  });

  test('Should inherit from BaseController and have schema validation', () => {
    expect(controller).toHaveProperty('validateCreateDtoSchema', adviceCreateDtoSchema);
    expect(controller).toHaveProperty('validateUpdateDtoSchema', adviceUpdateDtoSchema);
  });
});
