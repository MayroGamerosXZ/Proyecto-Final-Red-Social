FROM node:22-slim

# Instalar OpenSSL y certificados necesarios para Prisma y PostgreSQL
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar dependencias del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copiar esquema de Prisma y generar clientes para todos los targets
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copiar código fuente y compilar TypeScript
COPY backend/ ./
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
