import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError, randomHex } from '../utils';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const fallbackExt = file.mimetype.startsWith('video/')
      ? '.mp4'
      : file.mimetype.includes('webp')
      ? '.webp'
      : file.mimetype.includes('png')
      ? '.png'
      : '.jpg';
    const ext = rawExt || fallbackExt;
    const safeName = 'media_' + Date.now() + '_' + randomHex(4) + ext;
    cb(null, safeName);
  },
});

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 35 * 1024 * 1024, // 35MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Tipo de arquivo não suportado. Envie imagens (WebP, JPG, PNG) ou vídeos (MP4, WebM).'));
    }
  },
});

// POST /api/upload — upload de arquivo único (imagem ou vídeo)
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'O arquivo excede o limite máximo permitido de 35MB.'));
      }
      return next(err);
    }
    if (!req.file) {
      return next(new ApiError(400, 'Nenhum arquivo enviado.'));
    }

    const publicUrl = '/uploads/' + req.file.filename;
    res.status(201).json({
      url: publicUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  });
});

// POST /api/upload/multiple — upload de até 12 arquivos simultâneos
router.post('/multiple', (req, res, next) => {
  upload.array('files', 12)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Um dos arquivos excede o limite máximo permitido de 35MB.'));
      }
      return next(err);
    }
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return next(new ApiError(400, 'Nenhum arquivo enviado.'));
    }

    res.status(201).json({
      files: files.map((f) => ({
        url: '/uploads/' + f.filename,
        fileName: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
        type: f.mimetype.startsWith('video/') ? 'video' : 'image',
      })),
    });
  });
});

export default router;
