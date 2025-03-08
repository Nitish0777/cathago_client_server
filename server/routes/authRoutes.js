// /routes/authRoutes.js
import express from 'express';
import { signup, login ,getUserDetails ,sendCreditRequest } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// POST route for user signup
router.post('/signup', signup);

// POST route for user login
router.post('/login', login);

router.get('/profile', authenticate, getUserDetails);
router.post('/credits/request', authenticate, sendCreditRequest);
//router.get('/credits/getdocuments', authenticate, getUserCreditRequests);

export default router;
