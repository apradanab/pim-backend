import { type NextFunction, type Request, type Response } from 'express';
import { FilesController } from '../controllers/files.controller';

describe('Given an instance of the class FilesController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let controller: FilesController;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      json: jest.fn(),
    } as Partial<Response>;
    next = jest.fn();
    controller = new FilesController();
  });

  test('Then it should be an instance of the class', () => {
    expect(controller).toBeInstanceOf(FilesController);
  });

  describe('When the method fileHandler is used', () => {
    describe('And no image is uploaded', () => {
      test('Then it should call next with an error', () => {
        controller.fileHandler(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'No file uploaded',
          })
        );
      });
    });

    describe('And an image is uploaded', () => {
      test('Then it should return a success response', () => {
        req.body.image = 'https://cloudinary.com/test-image.jpg';

        controller.fileHandler(req as Request, res as Response, next);

        expect(res.json).toHaveBeenCalledWith({
          message: 'File uploaded successfully',
          url: 'https://cloudinary.com/test-image.jpg',
        });
      });
    });
  });
});
