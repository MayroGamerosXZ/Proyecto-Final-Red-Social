# Cuaderno de Evidencias Técnicas: Red Social Fullstack
**Proyecto Final de Desarrollo Web — Rúbrica Oficial (15 Puntos)**

Este documento es tu guía y plantilla para la recolección ordenada de capturas de pantalla de respaldo técnico. Cada evidencia está vinculada directamente a uno de los seis criterios de evaluación para certificar el cumplimiento ante el evaluador.

---

> [!TIP]
> **Recomendación para la toma de capturas**:
> - En capturas de navegador, asegúrate de que la **barra de direcciones (URL)** sea visible.
> - En capturas de terminal o Docker, asegúrate de que el **comando ejecutado y la salida exitosa** se lean claramente.
> - Puedes copiar y pegar cada bloque directamente en tu informe final de Word o PDF.

---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 1.1                                |
|                                                                                                  |
| 📸 Captura 1.1: Orquestación de Base de Datos y Servicios en Docker Compose                      |
|                                                                                                  |
| Muestra la terminal con el comando `docker compose ps` o la interfaz de Docker Desktop con los   |
| tres servicios operativos (`postgres_db`, `backend_api`, `frontend_web`) con estado 'Running'   |
| y puertos asignados (5432, 5000, 3000).                                                         |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 1.1: Docker Compose Orquestado ]       | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Base de datos y migraciones // Entorno reproducible en contenedores                     |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 1.2                                |
|                                                                                                  |
| 📸 Captura 1.2: Ejecución Exitosa de Migraciones Relacionales en PostgreSQL                      |
|                                                                                                  |
| Muestra la consola ejecutando `npx prisma migrate dev` (o `prisma migrate deploy`) donde se      |
| certifique la creación de las tablas relacionales (`User`, `Post`, `Comment`, `Like`, `Follow`,  |
| `Notification`) y el mensaje verde "Your database is now in sync with your schema".             |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 1.2: Migraciones Prisma Ejecutadas ]    | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Base de datos y migraciones (2 pts) — Modelo relacional y migraciones funcionales       |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 1.3                                |
|                                                                                                  |
| 📸 Captura 1.3: Modelo Relacional e Integridad en Prisma Studio o GUI de PostgreSQL              |
|                                                                                                  |
| Muestra la interfaz visual de Prisma Studio (`npx prisma studio`) en el navegador mostrando      |
| las tablas normalizadas con claves foráneas, registros de prueba (seeding) y relaciones activas. |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 1.3: Prisma Studio / DER en BD ]        | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Base de datos y migraciones (2 pts) — Integridad referencial y datos normalizados       |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 2.1                                |
|                                                                                                  |
| 📸 Captura 2.1: Registro de Usuario con Hash de Contraseña y Validación Zod                      |
|                                                                                                  |
| Muestra la petición de registro `POST /api/auth/register` (vía Postman/Swagger/Frontend) y la    |
| consulta en base de datos demostrando que la contraseña está cifrada con `bcrypt` (hash $2a$...  |
| nunca en texto plano) y que se validan campos vacíos o emails inválidos con error 400.           |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 2.1: Hash de Contraseña y Validación ]  | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Seguridad y validación (2 pts) — Cifrado seguro de contraseñas y validación de entrada  |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 2.2                                |
|                                                                                                  |
| 📸 Captura 2.2: Autenticación con Token JWT y Protección de Rutas con Middleware                 |
|                                                                                                  |
| Muestra el login exitoso `POST /api/auth/login` retornando el `token` JWT, y una petición a una   |
| ruta protegida (ej: `POST /api/posts`) incluyendo la cabecera `Authorization: Bearer <token>`    |
| junto con la verificación de que sin token devuelve `401 Unauthorized`.                          |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 2.2: Autenticación JWT y Protección ]   | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: API y lógica del backend // Seguridad y validación — Manejo de sesión y autorización    |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 2.3                                |
|                                                                                                  |
| 📸 Captura 2.3: Documentación Pública e Interactiva en Swagger UI (/api/docs)                     |
|                                                                                                  |
| Muestra el navegador en la URL `/api/docs` con la especificación OpenAPI 3.0 completa, donde se |
| listen todos los módulos (`Auth`, `Users`, `Posts`, `Likes`, `Comments`, `Follows`), sus esquemas|
| de petición/respuesta y el botón de autorización Bearer.                                        |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 2.3: Swagger / OpenAPI en /api/docs ]   | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: API y lógica del backend (3 pts) — Documentación pública interactiva en Swagger         |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 2.4                                |
|                                                                                                  |
| 📸 Captura 2.4: Gestión de Secretos (.env.example) y Políticas de CORS                          |
|                                                                                                  |
| Muestra en el editor de código el archivo `.env.example` en el repositorio sin secretos reales,   |
| y la configuración del middleware `cors` en el código fuente de Express restringiendo los        |
| orígenes autorizados.                                                                            |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 2.4: .env.example y Configuración CORS ]| |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Seguridad y validación (2 pts) — CORS estricto y manejo de secretos sin fugas           |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 3.1                                |
|                                                                                                  |
| 📸 Captura 3.1: Conexión WebSocket Establecida y Handshake Autenticado                           |
|                                                                                                  |
| Muestra la pestaña 'Red' (Network) -> filtro 'WS' en las DevTools del navegador con el socket    |
| conectado exitosamente (Status 101 Switching Protocols), enviando el token de autenticación.     |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 3.1: Handshake WebSocket 101 ]         | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Tiempo real (2 pts) — Conexión activa bidireccional con WebSocket                       |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 3.2                                |
|                                                                                                  |
| 📸 Captura 3.2: Notificación Instantánea y Actualización en Vivo sin Recargar                    |
|                                                                                                  |
| Muestra dos ventanas de navegador en paralelo: en la ventana izquierda el Usuario A reacciona   |
| o comenta un post; en la ventana derecha el Usuario B recibe de inmediato la notificación        |
| emergente (toast/badge) y el contador del post se incrementa en vivo sin refrescar la página.    |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 3.2: Evento en Vivo Doble Ventana ]     | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Tiempo real (2 pts) — Notificaciones y contadores en vivo sin recargar                  |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 4.1                                |
|                                                                                                  |
| 📸 Captura 4.1: Vistas de Autenticación (Login / Registro) con Validación Visual                 |
|                                                                                                  |
| Muestra la interfaz de usuario en `/login` y `/register` con diseño limpio, mensajes de error   |
| visuales en campos inválidos y adaptabilidad responsive completa.                                |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 4.1: Vistas de Login y Registro ]        | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Frontend funcional (3 pts) — Vistas principales operativas con validación cliente       |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 4.2                                |
|                                                                                                  |
| 📸 Captura 4.2: Feed General y Feed Personalizado (Siguiendo) con Publicaciones Multimedia       |
|                                                                                                  |
| Muestra la página principal `/feed` con selector de pestañas ('Para ti' vs 'Siguiendo'), el     |
| formulario de publicación con preview de imagen, y tarjetas de posts con likes y comentarios.    |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 4.2: Feed General y Personalizado ]     | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Frontend funcional (3 pts) — Feed general/personalizado y soporte multimedia            |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 4.3                                |
|                                                                                                  |
| 📸 Captura 4.3: Perfil de Usuario con Renderizado en el Servidor (SSR) y Conteo Dinámico        |
|                                                                                                  |
| Muestra la página de perfil `/[username]` con avatar, biografía, contadores (Seguidores,        |
| Seguidos, Posts) y el botón interactivo de "Seguir / Siguiendo", inspeccionando el código fuente|
| HTML para evidenciar el SSR (contenido renderizado en el HTML inicial).                         |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 4.3: Perfil de Usuario y Prueba SSR ]    | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Frontend funcional (3 pts) — Perfil de usuario y Server-Side Rendering (SSR)            |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 4.4                                |
|                                                                                                  |
| 📸 Captura 4.4: Verificación de Diseño Responsive (Móvil vs Escritorio)                          |
|                                                                                                  |
| Muestra la vista en modo emulador de dispositivo móvil (ej: iPhone 14 / 390px) junto a la vista |
| de escritorio, evidenciando menú colapsable (drawer), tarjetas ajustadas y legibilidad óptima.   |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 4.4: Adaptabilidad Móvil y Desktop ]     | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Frontend funcional (3 pts) — Diseño responsive en múltiples resoluciones               |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 5.1                                |
|                                                                                                  |
| 📸 Captura 5.1: Despliegue de la Base de Datos Relacional en la Nube (Neon / Supabase)           |
|                                                                                                  |
| Muestra el panel de control de Neon o Supabase con la instancia PostgreSQL activa, las tablas    |
| creadas mediante migraciones en producción y la cadena de conexión SSL habilitada.               |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 5.1: PostgreSQL en Neon / Supabase ]    | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Despliegue funcional (3 pts) — Base de datos relacional desplegada y accesible         |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 5.2                                |
|                                                                                                  |
| 📸 Captura 5.2: Despliegue del Backend en Render con Swagger Público Operativo                   |
|                                                                                                  |
| Muestra el panel de Render con el servicio 'Live' y una pestaña de navegador accediendo a la     |
| URL pública `https://mi-backend.onrender.com/api/docs` cargando la documentación interactiva.    |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 5.2: Backend y Swagger en Render ]      | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Despliegue funcional (3 pts) — Backend y Swagger públicos y funcionales                |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 5.3                                |
|                                                                                                  |
| 📸 Captura 5.3: Despliegue del Frontend en Vercel con Dominio Público Activo                     |
|                                                                                                  |
| Muestra el dashboard de Vercel con el despliegue 'Ready' y una pestaña de navegador navegando en|
| la URL pública `https://mi-proyecto.vercel.app` interactuando con el backend en producción.      |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 5.3: Frontend en Producción Vercel ]    | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Despliegue funcional (3 pts) — Frontend público y conexión HTTPS/WSS con backend        |
+--------------------------------------------------------------------------------------------------+
```

--- CORTE DE PÁGINA FORMAL ---

```
+--------------------------------------------------------------------------------------------------+
|                                  EVIDENCIA TÉCNICA // CAPTURA 6.1                                |
|                                                                                                  |
| 📸 Captura 6.1: Repositorio en GitHub con README.md Completo y Enlaces Públicos                  |
|                                                                                                  |
| Muestra el repositorio público en GitHub con la estructura de carpetas (`backend/`, `frontend/`),|
| el archivo `.env.example`, y el `README.md` renderizando los diagramas de arquitectura y los     |
| tres enlaces públicos de producción (App, API y Swagger).                                        |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| |                                                                                              | |
| |                                              🖼️                                              | |
| |          [ Espacio Reservado para Captura de Pantalla 6.1: Repositorio GitHub y README ]      | |
| |                                                                                              | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Rúbrica: Despliegue funcional (3 pts) — Documentación de arquitectura, instrucciones y enlaces   |
+--------------------------------------------------------------------------------------------------+
```
