import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     tags:
 *       - Búsqueda Avanzada
 *     summary: Buscar usuarios y publicaciones en tiempo real (Autocompletado)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, @username o contenido de post)
 *     responses:
 *       200:
 *         description: Resultados coincidentes de usuarios y publicaciones
 */
router.get('/', optionalAuth, globalSearch);

export default router;
