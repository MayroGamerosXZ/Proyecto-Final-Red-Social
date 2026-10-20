import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido de la publicación no puede estar vacío')
    .max(1000, 'El contenido no puede exceder 1000 caracteres'),
  imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

export const postIdParamSchema = z.object({
  id: z.string().uuid('ID de publicación inválido (debe ser UUID)'),
});
