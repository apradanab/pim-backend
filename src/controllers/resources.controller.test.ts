import { ResourcesController } from '../controllers/resources.controller';
import { type Repo } from '../repositories/type.repo';
import { type Resource, type ResourceCreateDto } from '../entities/resource';
import { resourceCreateDtoSchema, resourceUpdateDtoSchema } from '../entities/resource.schema';

describe('Given an instance of the ResourcesController class', () => {
  const repo: Repo<Resource, ResourceCreateDto> = {} as unknown as Repo<Resource, ResourceCreateDto>;
  const controller = new ResourcesController(repo);

  test('Should be an instance of the ResourcesController class', () => {
    expect(controller).toBeInstanceOf(ResourcesController);
  });

  test('Should inherit from BaseController and have schema validation', () => {
    expect(controller).toHaveProperty('validateCreateDtoSchema', resourceCreateDtoSchema);
    expect(controller).toHaveProperty('validateUpdateDtoSchema', resourceUpdateDtoSchema);
  });
});
