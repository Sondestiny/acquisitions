import express from 'express';
import userController from '../controllers/user.controller.js';

const userRouter = express.Router();

// GET /api/users - Get all users
userRouter.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
userRouter.get('/:id', userController.getUserById);

// POST /api/users - Create a new user
userRouter.post('/', userController.createUser);

// PUT /api/users/:id - Update user by ID
userRouter.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user by ID
userRouter.delete('/:id', userController.deleteUser);

export default userRouter;
