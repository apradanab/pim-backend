import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import { type Request, type Response, type NextFunction } from 'express';
import createDebug from 'debug';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:files:interceptor');

export class FilesInterceptor {
  constructor() {
    debug('Instantiated FilesInterceptor');
  }

  singleFile(fieldName = 'file') {
    debug(`Creating single file middleware ${fieldName}`);

    const storage = multer.memoryStorage();
    const upload = multer({ 
      storage,
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
     }).single(fieldName);

    return (req: Request, res: Response, next: NextFunction) => {
      debug(`Uploading single file: ${fieldName}`);
      upload(req, res, (err) => {
        if (err) {
          return next(new HttpError(500, 'File upload failed', err.message));
        }
        next();
      });
    };
  }

  async cloudinaryUpload(req: Request, res: Response, next: NextFunction) {
    debug('Uploading file to Cloudinary');

    const options = {
      folder: process.env.CLOUDINARY_FOLDER ?? 'pim-images',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    if (!req.file) {
      debug('No file uploaded, using default placeholder');
      req.body.image = 'https://res.cloudinary.com/djzn9f9kc/image/upload/v1739558839/pim-images/pim_nzjxbq.jpg';
      return next();
    }

    try {
      debug('Uploading file buffer to Cloudinary');

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options, 
          (error, result) => {
          if(error) reject(error);
          else resolve(result as UploadApiResponse);
        });

        uploadStream.end(req.file?.buffer);
      });

      req.body.image = result.secure_url;
      debug(`Upload successful: ${req.body.image}`);
      next();
    } catch (error) {
      next(new HttpError(500, 'Cloudinary upload failed', (error as Error).message));
    }
  }
}
