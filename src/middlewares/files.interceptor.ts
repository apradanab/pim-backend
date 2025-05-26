import { v2 as cloudinary } from 'cloudinary';
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
      limits: { fileSize: 8 * 1024 * 1024 },
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
    if(!req.file) return next();

    const fieldName = req.file.fieldname;
    debug(`Uploading file to Cloudinary: ${fieldName}`);

    const options = {
      folder: process.env.CLOUDINARY_FOLDER ?? 'pim-images',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        options
      );
      
      req.body[fieldName] = result.secure_url;        
      debug(`Upload successful: ${result.secure_url}`);
      next();
    } catch (error) {
      next(new HttpError(500, 'Cloudinary upload failed', (error as Error).message));
    }
  }
}
