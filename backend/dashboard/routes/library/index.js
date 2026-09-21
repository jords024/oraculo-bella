import express from 'express';
import libraryGalleryRouter from './libraryGallery.js';
import libraryUploadRouter from './libraryUpload.js';
import libraryChatRouter from './libraryChat.js';

const router = express.Router();

// ── Montagem modular dos sub-routers da Biblioteca ───────────────────────────
router.use(libraryGalleryRouter);
router.use(libraryUploadRouter);
router.use(libraryChatRouter);

export default router;
