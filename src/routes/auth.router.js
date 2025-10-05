import express from 'express';
import authController from '../controllers/auth.controller.js';
const authRouter = express.Router();
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register); 
authRouter.post('/logout', authController.logout);
export default authRouter;