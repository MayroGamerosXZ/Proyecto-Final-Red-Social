import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido de la publicación no puede estar vacío')
    .max(1000, 'El contenido no puede exceder 1000 caracteres'),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
      { message: 'La imagen debe ser una URL válida o formato Data URI' }
    )
    .optional()
    .or(z.literal('')),
});

export const postIdParamSchema = z.object({
  id: z.string().uuid('ID de publicación inválido (debe ser UUID)'),
});

export const updatePostSchema = z
  .object({
    content: z
      .string()
      .min(1, 'El contenido de la publicación no puede estar vacío')
      .max(1000, 'El contenido no puede exceder 1000 caracteres')
      .optional(),
    imageUrl: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
        { message: 'La imagen debe ser una URL válida o formato Data URI' }
      )
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.content !== undefined || data.imageUrl !== undefined, {
    message: 'Debe proporcionar al menos contenido o imagen para actualizar',
  });
