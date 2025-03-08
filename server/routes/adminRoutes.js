// routes/adminRoutes.js

import express from 'express';
import { deleteUser ,handleCreditRequest ,getAdminAnalytics,getAllUsers ,getAllCreditRequests ,} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'; // Import the middleware functions

const router = express.Router();

// DELETE route to delete a user by userId
router.delete('/delete/:userId', authenticate, isAdmin, deleteUser);
router.post('/credits/handleRequest', authenticate, isAdmin, handleCreditRequest);
router.get('/analytics', authenticate, isAdmin, getAdminAnalytics);
router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/credit-requests', authenticate, isAdmin, getAllCreditRequests);
export default router;
