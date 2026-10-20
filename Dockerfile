FROM node:22-alpine

WORKDIR /app

# Copiar manifiestos e instalar dependencias del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Generar cliente de Prisma
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copiar código fuente y compilar TypeScript a JavaScript
COPY backend/ ./
RUN npm run build

# Render asigna el puerto automáticamente mediante la variable $PORT
ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
