import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { env } from '../config/env';

const router = Router();

// Configurar Cloudinary si las credenciales están presentes
if (env.CLOUDINARY.cloud_name && env.CLOUDINARY.api_key && env.CLOUDINARY.api_secret) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY.cloud_name,
    api_key: env.CLOUDINARY.api_key,
    api_secret: env.CLOUDINARY.api_secret,
  });
}

// Configurar multer en memoria (hasta 15MB por imagen)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP, GIF)'));
    }
  },
});

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags:
 *       - Multimedia
 *     summary: Subir una imagen local desde el dispositivo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen seleccionado desde el dispositivo
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente con URL pública permanente
 *       400:
 *         description: Archivo no proporcionado o formato inválido
 *       401:
 *         description: No autorizado
 */
router.post(
  '/',
  authenticateJWT,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha seleccionado ningún archivo de imagen',
        });
      }

      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // Intentar subir a Cloudinary CDN si está configurado
      if (env.CLOUDINARY.cloud_name && env.CLOUDINARY.api_key && env.CLOUDINARY.api_secret) {
        try {
          const uploadResult = await cloudinary.uploader.upload(fileBase64, {
            folder: 'socialpulse_uploads',
            resource_type: 'image',
          });

          return res.status(200).json({
            success: true,
            url: uploadResult.secure_url,
            provider: 'cloudinary',
          });
        } catch (cloudinaryError: any) {
          console.warn(
            '[Upload] Cloudinary falló, recurriendo a Data URI Base64:',
            cloudinaryError.message
          );
        }
      }

      // Fallback seguro: retornar Data URI Base64 (garantiza compatibilidad universal sin dependencias externas)
      return res.status(200).json({
        success: true,
        url: fileBase64,
        provider: 'base64',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
