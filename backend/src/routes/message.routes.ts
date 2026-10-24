import { Router } from 'express';
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
} from '../controllers/message.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/messages/conversations:
 *   get:
 *     tags:
 *       - Mensajería Directa (Chat)
 *     summary: Obtener todas las conversaciones activas del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones con último mensaje y no leídos
 *       401:
 *         description: No autorizado
 */
router.get('/conversations', authenticateJWT, getConversations);

/**
 * @openapi
 * /api/messages/{userId}:
 *   get:
 *     tags:
 *       - Mensajería Directa (Chat)
 *     summary: Obtener el historial de chat con un usuario específico
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de mensajes ordenados cronológicamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *   post:
 *     tags:
 *       - Mensajería Directa (Chat)
 *     summary: Enviar un mensaje directo a un usuario en tiempo real
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: ¡Hola! ¿Cómo estás?
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente y emitido vía WebSockets
 *       400:
 *         description: Mensaje vacío o autoenvío no permitido
 *       401:
 *         description: No autorizado
 */
router.get('/:userId', authenticateJWT, getMessagesWithUser);
router.post('/:userId', authenticateJWT, sendMessage);

export default router;
