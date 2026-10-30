import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Error de validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos de entrada',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Error de Multer (subida de archivos)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo excede el tamaño máximo permitido (15 MB)'
          : `Error en subida de archivo: ${err.message}`,
    });
  }

  // Error de filtro de archivo no permitido
  if (err.message && err.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Error HTTP personalizado
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
