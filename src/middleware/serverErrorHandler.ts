import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { RegistrationError } from '../errors/RegistrationError';

export const serverErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error, { 
    path: req.path,
    method: req.method,
    body: req.body 
  });

  if (error instanceof RegistrationError) {
    return res.status(500).json({
      error: {
        message: 'Registration service is temporarily unavailable',
        status: 500
      }
    });
  }

  return res.status(500).json({
    error: {
      message: 'Internal server error',
      status: 500
    }
  });
};
