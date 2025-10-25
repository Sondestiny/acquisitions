import bcrypt from 'bcrypt';
import logger from '../config/logger.js';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
const saltRounds = 10;
const authService = {
  hashPassword : async (password) => {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Error hashing password', error);
      throw new Error('Error hashing password');
            
    }
  },
  verifyPassword : async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password', error);
      throw new Error('Error verifying password');
    }
  },
  createUser : async ({email, password, name, role='user'}) => {
    try {
      // Simulate user creation logic
      const userExists = await db
        .select()
        .from(users)
        .where(users.email.eq(email))
        .limit(1);
      if (userExists.length > 0) {
        throw new Error('User already exists');
      }
      const hashedPassword = await authService.hashPassword(password);
      const userData = {
        email,
        password: hashedPassword,
        name,
        role,
        created_at: new Date()
      };
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning({
          email: users.email, 
          name: users.name, 
          role: users.role, 
          createAt: users.created_at
        });
            
      logger.info('User created successfully', userData);
      return newUser;
    } catch (error) {
      logger.error('Error creating user', error);
      throw new Error('Error creating user');
    }
  },
  register: async ({ email, password, name, role = 'user' }) => {
    logger.info('Registering user', { email });
    return await authService.createUser({ email, password, name, role });
  },
  login: async ({ email, password }) => {
    try {
      logger.info('User login attempt', { email });
      const [user] = await db
        .select()
        .from(users)
        .where(users.email.eq(email))
        .limit(1);

      if (!user) {
        logger.warn('Login failed: user not found', { email });
        throw new Error('Invalid email or password');
      }

      const passwordMatch = await authService.verifyPassword(password, user.password);
      if (!passwordMatch) {
        logger.warn('Login failed: incorrect password', { email });
        throw new Error('Invalid email or password');
      }

      logger.info('User logged in successfully', { email });
      // You can add token generation here if needed
      return {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      };
    } catch (error) {
      logger.error('Error during login', { email, error: error.message });
      throw new Error('Login failed');
    }
  }
};


export default authService;