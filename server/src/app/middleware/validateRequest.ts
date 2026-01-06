import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: ZodSchema<unknown>) => {
  if (!schema) throw new Error('Zod schema is undefined!'); // <-- Helpful debug

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorSources: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw error;
    }
  });
};

export default validateRequest;
