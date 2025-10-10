import logger from '../config/logger.js';
import userService from '../services/user.service.js';
import { formatValidationErrors } from '../utils/format.js';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validations/user.validation.js';

const userController = {
  /**
   * Get all users
   * GET /api/users
   */
  getAllUsers: async (req, res, next) => {
    try {
      logger.info('Getting all users request');
      
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          count: users.length
        }
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller', { error: error.message });
      next(error);
    }
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById: async (req, res, next) => {
    try {
      // Validate user ID parameter
      const validation = userIdSchema.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          errors: formatValidationErrors(validation.error),
          data: null
        });
      }

      const { id } = validation.data;
      logger.info('Getting user by ID request', { id });

      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      logger.error('Error in getUserById controller', { 
        id: req.params.id, 
        error: error.message 
      });
      
      if (error.message === 'Invalid user ID provided') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          data: null
        });
      }
      
      next(error);
    }
  },

  /**
   * Create a new user
   * POST /api/users
   */
  createUser: async (req, res, next) => {
    try {
      // Validate request body
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatValidationErrors(validation.error),
          data: null
        });
      }

      const userData = validation.data;
      logger.info('Creating user request', { email: userData.email });

      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      logger.error('Error in createUser controller', { 
        email: req.body?.email, 
        error: error.message 
      });
      
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          data: null
        });
      }
      
      next(error);
    }
  },

  /**
   * Update user by ID
   * PUT /api/users/:id
   */
  updateUser: async (req, res, next) => {
    try {
      // Validate user ID parameter
      const idValidation = userIdSchema.safeParse(req.params);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          errors: formatValidationErrors(idValidation.error),
          data: null
        });
      }

      // Validate request body
      const bodyValidation = updateUserSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatValidationErrors(bodyValidation.error),
          data: null
        });
      }

      const { id } = idValidation.data;
      const updateData = bodyValidation.data;
      
      logger.info('Updating user request', { 
        id, 
        fields: Object.keys(updateData) 
      });

      const updatedUser = await userService.updateUser(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Error in updateUser controller', { 
        id: req.params.id, 
        error: error.message 
      });
      
      if (error.message === 'Invalid user ID provided') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          data: null
        });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }
      
      if (error.message === 'Email is already taken by another user') {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another user',
          data: null
        });
      }
      
      if (error.message === 'No valid fields provided for update') {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update',
          data: null
        });
      }
      
      next(error);
    }
  },

  /**
   * Delete user by ID
   * DELETE /api/users/:id
   */
  deleteUser: async (req, res, next) => {
    try {
      // Validate user ID parameter
      const validation = userIdSchema.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          errors: formatValidationErrors(validation.error),
          data: null
        });
      }

      const { id } = validation.data;
      logger.info('Deleting user request', { id });

      await userService.deleteUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteUser controller', { 
        id: req.params.id, 
        error: error.message 
      });
      
      if (error.message === 'Invalid user ID provided') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID provided',
          data: null
        });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }
      
      next(error);
    }
  }
};

export default userController;