import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registrar un nuevo usuario
 *     description: Crea un nuevo usuario en la plataforma con contraseña cifrada (bcrypt) y genera un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 example: carlos_dev
 *               email:
 *                 type: string
 *                 example: carlos@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               fullName:
 *                 type: string
 *                 example: Carlos Mendoza
 *               bio:
 *                 type: string
 *                 example: Desarrollador apasionado
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación en campos
 *       409:
 *         description: El email o nombre de usuario ya está registrado
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión
 *     description: Valida credenciales de acceso y retorna token JWT para autorizar peticiones subsecuentes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: carlos@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso con token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *       401:
 *         description: Token no provisto o inválido
 */
router.get('/me', authenticateJWT, getMe);

export default router;
