import { Router } from 'express';
import {
  createPost,
  updatePost,
  getGlobalFeed,
  getFollowingFeed,
  getUserPosts,
  deletePost,
  toggleLike,
  getPostReactions,
  createComment,
  getComments,
  toggleBookmark,
  getSavedPosts,
} from '../controllers/post.controller';
import { authenticateJWT, optionalAuth } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validateRequest';
import { createPostSchema, updatePostSchema, postIdParamSchema } from '../schemas/post.schema';
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
 *     summary: Obtener el feed global de publicaciones (con estado personal si está autenticado)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (mínimo 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de publicaciones por página (máximo 50)
 *     responses:
 *       200:
 *         description: Lista de publicaciones recientes
 */
router.get('/feed', optionalAuth, getGlobalFeed);

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
 * /api/posts/saved:
 *   get:
 *     tags:
 *       - Guardados / Marcadores
 *     summary: Obtener todas las publicaciones guardadas por el usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de publicaciones guardadas
 *       401:
 *         description: No autorizado
 */
router.get('/saved', authenticateJWT, getSavedPosts);

/**
 * @openapi
 * /api/posts/user/{username}:
 *   get:
 *     tags:
 *       - Publicaciones
 *     summary: Obtener todas las publicaciones de un usuario específico
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
 *         description: Lista de publicaciones del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:username', optionalAuth, getUserPosts);

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     tags:
 *       - Publicaciones
 *     summary: Editar una publicación propia (contenido o imagen)
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
 *             properties:
 *               content:
 *                 type: string
 *                 example: Contenido editado de la publicación
 *               imageUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe
 *     responses:
 *       200:
 *         description: Publicación actualizada correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No autorizado
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
router.put('/:id', authenticateJWT, validateParams(postIdParamSchema), validateBody(updatePostSchema), updatePost);
router.delete('/:id', authenticateJWT, validateParams(postIdParamSchema), deletePost);

/**
 * @openapi
 * /api/posts/{id}/bookmark:
 *   post:
 *     tags:
 *       - Guardados / Marcadores
 *     summary: Guardar o quitar de guardados una publicación (Toggle Bookmark)
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
 *         description: Estado de guardado alternado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publicación no encontrada
 */
router.post('/:id/bookmark', authenticateJWT, validateParams(postIdParamSchema), toggleBookmark);

/**
 * @openapi
 * /api/posts/{id}/like:
 *   post:
 *     tags:
 *       - Interacciones (Likes)
 *     summary: Dar, alternar o reaccionar con emoji a una publicación (Toggle en tiempo real)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: '🔥'
 *                 description: Emoji de la reacción (máximo 16 caracteres). Por defecto ❤️.
 *     responses:
 *       200:
 *         description: Estado de like actualizado y emitido en vivo vía WebSocket
 *       400:
 *         description: Emoji inválido
 *       401:
 *         description: No autorizado
 */
/**
 * @openapi
 * /api/posts/{id}/likes:
 *   get:
 *     tags:
 *       - Interacciones (Likes)
 *     summary: Obtener el listado detallado de usuarios y desglose por emoji que reaccionaron a una publicación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista detallada de reacciones y contadores por emoji
 */
router.get('/:id/likes', validateParams(postIdParamSchema), getPostReactions);
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
