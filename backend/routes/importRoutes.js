import express from 'express';
import { upload, uploadFiles, getFilePreview, getSampleData } from '../controllers/importController.js';
import { authenticateUserOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All import routes require authentication
router.use(authenticateUserOrAdmin);

router.post('/upload', upload.any(), uploadFiles);
router.post('/preview', getFilePreview);
router.get('/sample/:filename', getSampleData);

export default router;