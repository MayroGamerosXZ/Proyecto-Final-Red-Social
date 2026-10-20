import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // Limpiar datos existentes en orden de integridad referencial
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Crear usuarios demo
  const user1 = await prisma.user.create({
    data: {
      username: 'carlos_dev',
      email: 'carlos@example.com',
      passwordHash,
      fullName: 'Carlos Mendoza',
      bio: 'Fullstack Developer apasionado por React, Node.js y Cloud Computing 🚀',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'ana_tech',
      email: 'ana@example.com',
      passwordHash,
      fullName: 'Ana Gómez',
      bio: 'Diseñadora UI/UX y Frontend Specialist. Creando experiencias memorables ✨',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'mayro_xz',
      email: 'mayro@example.com',
      passwordHash,
      fullName: 'Mayro Gameros',
      bio: 'Ingeniero de Software y creador de esta Red Social Fullstack 💻⚡',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  console.log(`✅ Usuarios creados: ${user1.username}, ${user2.username}, ${user3.username}`);

  // 2. Relaciones de seguimiento (Follows)
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user3.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user3.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  console.log('✅ Relaciones de seguimiento (Follows) establecidas');

  // 3. Crear publicaciones
  const post1 = await prisma.post.create({
    data: {
      userId: user3.id,
      content: '¡Bienvenidos a nuestra nueva Red Social Fullstack! Desarrollada con Next.js 15 SSR, Express, PostgreSQL, Prisma y WebSockets en tiempo real 🎉',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'Probando la arquitectura de micro-servicios y contenedores Docker. La persistencia relacional con PostgreSQL y Prisma es ultra rápida ⚡',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'El diseño responsive y la paleta de colores moderna le dan una vibra increíble a la interfaz. ¿Qué opinan del feed?',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    },
  });

  console.log('✅ Publicaciones iniciales creadas');

  // 4. Crear Likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user1.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: user3.id,
    },
  });

  console.log('✅ Likes iniciales registrados');

  // 5. Crear Comentarios
  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user2.id,
      content: '¡Felicitaciones Mayro! La fluidez con WebSockets se siente instantánea 🚀',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user1.id,
      content: 'Excelente trabajo con la documentación Swagger y la seguridad de contraseñas.',
    },
  });

  console.log('✅ Comentarios iniciales agregados');

  // 6. Crear Notificaciones de ejemplo
  await prisma.notification.create({
    data: {
      recipientId: user3.id,
      actorId: user1.id,
      type: 'LIKE',
      postId: post1.id,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: user3.id,
      actorId: user2.id,
      type: 'COMMENT',
      postId: post1.id,
      isRead: false,
    },
  });

  console.log('✅ Notificaciones creadas');
  console.log('🎉 Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
