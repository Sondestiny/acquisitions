import JwToken from '../config/jwtoken.js';
import logger from '../config/logger.js';
import authService from '../services/auth.service.js';
import cookie from '../utils/cookie.js';
import { formatValidationErrors } from '../utils/format.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';


const authController = {
  login: async (req, res, next) => {
    try {
      // Validate request body
      const validationLogin = loginSchema.safeParse(req.body);
      if (!validationLogin.success) {
        return res.status(400).json({
          error: validationLogin.error,
          detail: formatValidationErrors(validationLogin.error)
        });
      }
      const { email, password } = validationLogin.data;
      // Authenticate user
      const user = await authService.login({ email, password });
      // Create JWT token
      const token = JwToken.signIn({ name: user.name, email: user.email, role: user.role });
      // Set cookie
      cookie.SetCookie(res, 'token', token);
      logger.info('User logged in successfully', { email: user.email });
      res.status(200).json({
        message: 'Login successful',
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Login error', { error: error.message });
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      // validate request body
      const validationRegister = registerSchema.safeParse(req.body);
      if (!validationRegister.success) {
        return res.status(400).json({ 
          error: validationRegister.error,
          detail: formatValidationErrors(validationRegister.error)
        });
      }
      // Create user
      const { name, email, password, role } = validationRegister.data;
      const user = await authService.register({name, email, password, role});
      // create JWT token
      const token = JwToken.signIn({ name: user.name, email: user.email, role: user.role });
      // Set cookie
      cookie.SetCookie(res, 'token', token);
      logger.info(`User registered successfully ${user.email}`);
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.name, 
          name: user.name, 
          email: user.email, 
          role: user.role}
      });
    } catch (error) {
      logger.error('Registration error', error);
      next(error);
    }
  },
  logout: (req, res) => {
    try {
      cookie.ClearCookie(res, 'token');
      logger.info('User logged out');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error', { error: error.message });
      res.status(500).json({ message: 'Logout failed' });
    }
  },
};
export default authController;