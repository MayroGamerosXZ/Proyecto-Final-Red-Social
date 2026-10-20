import { Router } from 'express';
import {
  createPost,
  getGlobalFeed,
  getFollowingFeed,
  getUserPosts,
  deletePost,
  toggleLike,
  createComment,
  getComments,
} from '../controllers/post.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validateRequest';
import { createPostSchema, postIdParamSchema } from '../schemas/post.schema';
import { createCommentSchema } from '../schemas/comment.schema';

const router = Router();

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags:
 *       - Publicaciones
 *     summary: Crear una nueva publicación
 *     security:
 *       - BearerAuth: []
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
 *                 example: ¡Mi primera publicación en la red social!
 *               imageUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticateJWT, validateBody(createPostSchema), createPost);

/**
 * @openapi
 * /api/posts/feed:
 *   get:
 *     tags:
 *       - Publicaciones
 *     summary: Obtener el feed global de publicaciones
 *     responses:
 *       200:
 *         description: Lista de publicaciones recientes
 */
router.get('/feed', getGlobalFeed);

/**
 * @openapi
 * /api/posts/feed/following:
 *   get:
 *     tags:
 *       - Publicaciones
 *     summary: Obtener feed personalizado de publicaciones de seguidos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de publicaciones de los usuarios seguidos
 *       401:
 *         description: No autorizado
 */
router.get('/feed/following', authenticateJWT, getFollowingFeed);

/**
 * @openapi
 * /api/posts/user/{username}:
 *   get:
 *     tags:
 *       - Publicaciones
 *     summary: Obtener todas las publicaciones de un usuario específico
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de publicaciones del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:username', getUserPosts);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     tags:
 *       - Publicaciones
 *     summary: Eliminar una publicación propia
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
 *         description: Publicación eliminada
 *       403:
 *         description: No puedes eliminar publicaciones de otros usuarios
 *       404:
 *         description: Publicación no encontrada
 */
router.delete('/:id', authenticateJWT, validateParams(postIdParamSchema), deletePost);

/**
 * @openapi
 * /api/posts/{id}/like:
 *   post:
 *     tags:
 *       - Interacciones (Likes)
 *     summary: Dar o quitar like a una publicación (Toggle en tiempo real)
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
 *         description: Estado de like actualizado y emitido en vivo vía WebSocket
 */
router.post('/:id/like', authenticateJWT, validateParams(postIdParamSchema), toggleLike);

/**
 * @openapi
 * /api/posts/{id}/comments:
 *   get:
 *     tags:
 *       - Interacciones (Comentarios)
 *     summary: Listar comentarios de una publicación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista ordenada de comentarios
 *   post:
 *     tags:
 *       - Interacciones (Comentarios)
 *     summary: Agregar un comentario a una publicación
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 example: Excelente post!
 *     responses:
 *       201:
 *         description: Comentario creado y evento emitido en vivo
 */
router.get('/:id/comments', validateParams(postIdParamSchema), getComments);
router.post(
  '/:id/comments',
  authenticateJWT,
  validateParams(postIdParamSchema),
  validateBody(createCommentSchema),
  createComment
);

export default router;
