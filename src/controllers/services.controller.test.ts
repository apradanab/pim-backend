import { ServicesController } from '../controllers/services.controller';
import { type Repo } from '../repositories/type.repo';
import { type Service, type ServiceCreateDto } from '../entities/service';
import { serviceCreateDtoSchema, serviceUpdateDtoSchema } from '../entities/service.schema';

describe('Given an instance of the ServiceController class', () => {
  const repo: Repo<Service, ServiceCreateDto> = {} as unknown as Repo<Service, ServiceCreateDto>;
  const controller = new ServicesController(repo);

  test('Should be an instance of the ServicesController class', () => {
    expect(controller).toBeInstanceOf(ServicesController);
  });

  test('Should inherit from BaseController and have schema validation', () => {
    expect(controller).toHaveProperty('validateCreateDtoSchema', serviceCreateDtoSchema);
    expect(controller).toHaveProperty('validateUpdateDtoSchema', serviceUpdateDtoSchema);
  });
});
