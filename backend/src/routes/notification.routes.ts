import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notificaciones
 *     summary: Obtener historial de notificaciones del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones y conteo de no leídas
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateJWT, getNotifications);

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     tags:
 *       - Notificaciones
 *     summary: Marcar todas las notificaciones como leídas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 */
router.patch('/read-all', authenticateJWT, markAllAsRead);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notificaciones
 *     summary: Marcar una notificación individual como leída
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
 *         description: Notificación actualizada
 */
router.patch('/:id/read', authenticateJWT, markAsRead);

export default router;
