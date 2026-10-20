import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe contener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(60, 'El nombre completo no puede exceder 60 caracteres'),
  bio: z.string().max(200, 'La biografía no puede exceder 200 caracteres').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(60).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url('URL de avatar inválida').optional().or(z.literal('')),
});
