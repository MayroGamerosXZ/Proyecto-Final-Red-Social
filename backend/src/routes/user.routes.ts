import { Router } from 'express';
import {
  getProfileByUsername,
  updateProfile,
  followUser,
  unfollowUser,
  getSuggestedUsers,
} from '../controllers/user.controller';
import { authenticateJWT, optionalAuth } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateRequest';
import { updateProfileSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * @openapi
 * /api/users/suggestions:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener sugerencias de usuarios para seguir (excluye usuarios ya seguidos)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios sugeridos
 */
router.get('/suggestions', optionalAuth, getSuggestedUsers);

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       401:
 *         description: No autorizado
 */
router.put('/profile', authenticateJWT, validateBody(updateProfileSchema), updateProfile);

/**
 * @openapi
 * /api/users/{username}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener perfil público por nombre de usuario (con estado isFollowing si está autenticado)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos públicos del perfil con contadores
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:username', optionalAuth, getProfileByUsername);

/**
 * @openapi
 * /api/users/{id}/follow:
 *   post:
 *     tags:
 *       - Seguimiento
 *     summary: Seguir a un usuario
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Siguiendo al usuario con notificación emitida
 *       400:
 *         description: Intento de auto-seguimiento
 *       401:
 *         description: No autorizado
 *   delete:
 *     tags:
 *       - Seguimiento
 *     summary: Dejar de seguir a un usuario
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dejaste de seguir al usuario
 */
router.post('/:id/follow', authenticateJWT, followUser);
router.delete('/:id/follow', authenticateJWT, unfollowUser);

export default router;
