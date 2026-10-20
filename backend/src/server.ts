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

const app: Application = express();
const server = http.createServer(app);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación pública OpenAPI / Swagger en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
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
