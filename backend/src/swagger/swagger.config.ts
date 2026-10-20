import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Red Social API - Documentación Oficial',
    version: '1.0.0',
    description:
      'API REST con autenticación JWT, soporte multimedia, interacciones sociales (likes, comentarios, follows) y WebSockets para notificaciones y contadores en tiempo real.',
    contact: {
      name: 'Desarrollo Web - Proyecto Final',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Servidor Local de Desarrollo',
    },
    {
      url: 'https://mi-backend.onrender.com',
      description: 'Servidor de Producción (Render)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT obtenido en /api/auth/login con el prefijo Bearer',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
