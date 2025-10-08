import express from 'express';
import { authenticate } from '#middleware/auth.middleware.js';
import { securityMiddleware } from '#middleware/security.middleware.js';
import {
  getUsers,
  getUserByIdController,
  updateUserController,
  deleteUserController
} from '#controllers/users.controller.js';

const router = express.Router();

// Apply security middleware to all routes
router.use(securityMiddleware);

// Apply authentication middleware to all user routes
router.use(authenticate);

// GET /users - Get all users
router.get('/', getUsers);

// GET /users/:id - Get user by ID
router.get('/:id', getUserByIdController);

// PUT /users/:id - Update user
router.put('/:id', updateUserController);

// DELETE /users/:id - Delete user
router.delete('/:id', deleteUserController);

export default router;
