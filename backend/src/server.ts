import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './swagger/swagger.config';
import { initSocketServer } from './sockets/socket.server';
import { errorHandler } from './middlewares/errorHandler';

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import messageRoutes from './routes/message.routes';
import searchRoutes from './routes/search.routes';

const app: Application = express();
const server = http.createServer(app);

// Deshabilitar cabecera publicitaria de Express (M4)
app.disable('x-powered-by');

// Cabeceras de seguridad HTTP fundamentales
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Inicializar WebSockets con Socket.io
initSocketServer(server);

// Configuración de CORS estricto
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (ej. curl, Postman, SSR server-to-server)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen CORS no permitido por políticas de seguridad: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Aumentar el límite de payload para soportar imágenes locales y Base64 de hasta 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Documentación pública OpenAPI / Swagger en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Sistema y Monitoreo
 *     summary: Estado de salud y disponibilidad del servicio backend
 *     responses:
 *       200:
 *         description: Servicio en línea con métricas de tiempo de actividad
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Montar endpoints REST de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);

// Manejador global de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = env.PORT;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor backend ejecutándose en puerto: ${PORT}`);
  console.log(`📚 Documentación Swagger disponible en: /api/docs`);
  console.log(`⚡ WebSocket Server activo`);
  console.log(`=======================================================`);
});

export { app, server };
