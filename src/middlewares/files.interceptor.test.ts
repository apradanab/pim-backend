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
    let mockMiddleware: jest.Mock;
    let errorMiddleware: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();

      mockMiddleware = jest.fn((req, res, next) => next());
      errorMiddleware = jest.fn((req, res, next) => next(new HttpError(500, 'File upload failed', 'Multer error')));

      multer.memoryStorage = jest.fn();
      (multer as unknown as jest.Mock).mockReturnValue({
        single: jest.fn().mockImplementation(() => mockMiddleware),
      });
    });

    test('Then it should call Multer middleware without errors', () => {
      const middleware = interceptor.singleFile();
      middleware(req, res, next);
      expect(mockMiddleware).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('Then it should call next with an error when upload fails', () => {
      (multer as unknown as jest.Mock).mockReturnValue({
        single: jest.fn().mockImplementation(() => errorMiddleware),
      });

      const middleware = interceptor.singleFile();
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  describe('When the method cloudinaryUpload is used', () => {
    let mockUpload: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      req.body = {};
      mockUpload = jest.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/test-image.jpg'
      });
      cloudinary.uploader.upload = mockUpload;
    });

    test('Then it should upload a file successfully', async () => {
      req.file = { 
        fieldname: 'avatar',
        buffer: Buffer.from('test'),
        mimetype: 'image.png'
      } as unknown as Express.Multer.File;

      await interceptor.cloudinaryUpload(req, res, next);

      expect(mockUpload).toHaveBeenCalled();
      expect(req.body.avatar).toBe('https://cloudinary.com/test-image.jpg');
      expect(next).toHaveBeenCalled();
    });

    test('Then it should continue without error when no file is uploaded', async () => {
      req.file = undefined;
      cloudinary.uploader.upload = jest.fn();

      await interceptor.cloudinaryUpload(req, res, next);

      expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
      expect(req.body.avatar).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test('Then it should handle upload errors', async () => {
      req.file = { 
        fieldname: 'avatar',
        buffer: Buffer.from('test'),
        mimetype: 'image/png'
      } as unknown as Express.Multer.File;

      cloudinary.uploader.upload = jest.fn().mockRejectedValue(new Error('Upload failed'));

      await interceptor.cloudinaryUpload(req, res, next);

      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusMessage: 'Cloudinary upload failed' }));
    });
  });
});
