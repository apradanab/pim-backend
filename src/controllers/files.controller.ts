import { type NextFunction, type Request, type Response } from 'express';
import createDebug from 'debug';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:files:controller');

export class FilesController {
  constructor() {
    debug('Instantiated FilesController');
  }

  fileHandler(req: Request, res: Response, next: NextFunction) {
    debug('Handling file upload response');
    if (!req.body.image) {  
      return next(new HttpError(400, 'Bad Request', 'No file uploaded'));
    }

    res.json({
      message: 'File uploaded successfully',
      url: req.body.image,
    });
  }
}
