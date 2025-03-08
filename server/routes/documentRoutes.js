import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadDocument, scanDocument ,getMatchingDocuments,getUserDocuments} from '../controllers/documentController.js';

const router = express.Router();

router.post('/upload', authenticate, uploadDocument, scanDocument);
router.get('/matches/:docId', authenticate, getMatchingDocuments);
router.get('/documents', authenticate, getUserDocuments);
export default router;
