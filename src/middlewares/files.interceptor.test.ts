import { type Request, type Response, type NextFunction } from 'express';
import { FilesInterceptor } from '../middlewares/files.interceptor';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../middlewares/errors.middleware';

jest.mock('multer');
jest.mock('cloudinary');

describe('Given an instance of the class FilesInterceptor', () => {
  const interceptor = new FilesInterceptor();
  const req = {
    body: {},
    file: {},
  } as unknown as Request;
  const res = {} as unknown as Response;
  const next = jest.fn();

  test('Then it should be an instance of the class', () => {
    expect(interceptor).toBeInstanceOf(FilesInterceptor);
  });

  describe('When the method singleFile is used', () => {
    const mockMiddleware = jest.fn((req, res, next) => {
    next();
  });

    multer.memoryStorage = jest.fn();
    (multer as unknown as jest.Mock).mockReturnValue({
      single: jest.fn().mockReturnValue(mockMiddleware)
    });

    test('Then it should call Multer middleware without errors', () => {
      const middleware = interceptor.singleFile();
      middleware(req, res, next);
      expect(mockMiddleware).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('Then it should call next with an error when upload fails', () => {
      const errorMiddleware = jest.fn((req, res, next) => {
        next(new HttpError(500, 'File upload failed', 'Multer error'));
      });

      (multer as unknown as jest.Mock).mockReturnValue({
        single: jest.fn().mockReturnValue(errorMiddleware),
      });

      const middleware = interceptor.singleFile();
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  describe('When the method cloudinaryUpload is used', () => {
    let uploadMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
   

    endMock = jest.fn();
    uploadMock = jest.fn().mockImplementation((_options, callback) => {
      return {
          end: endMock.mockImplementation((buffer) => {
          callback(null, { secure_url: 'https://cloudinary.com/test-image.jpg' });
          }),
        };
      });

      cloudinary.uploader.upload_stream = uploadMock;
    });

    test('Then it should upload a file succesfully and call uploadStream.end()', async () => {
      req.file = { buffer: Buffer.from('test') } as unknown as Express.Multer.File;

      await interceptor.cloudinaryUpload(req, res, next);

      expect(uploadMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalledWith(req.file.buffer);
      expect(req.body.image).toBe('https://cloudinary.com/test-image.jpg');
      expect(next).toHaveBeenCalled();
    });

    test('Then it should set a default image when no file is uploaded', async () => {
      req.file = undefined;

      await interceptor.cloudinaryUpload(req, res, next);

      expect(req.body.image).toBe('https://res.cloudinary.com/djzn9f9kc/image/upload/v1739558839/pim-images/pim_nzjxbq.jpg');
      expect(next).toHaveBeenCalled();
    });

    test('Then it should handle upload errors', async () => {
      req.file = { buffer: Buffer.from('test') } as unknown as Express.Multer.File;

      uploadMock.mockImplementation((_options, callback) => {
        return {
          end: jest.fn(() => callback(new Error('Upload failed'))),
        };
      });

      await interceptor.cloudinaryUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });
});
