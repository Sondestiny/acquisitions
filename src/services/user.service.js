import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import logger from '../config/logger.js';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';

const saltRounds = 10;

const userService = {
  /**
   * Retrieves all users from the database
   * @returns {Promise<Array>} Array of user objects without passwords
   */
  getAllUsers: async () => {
    try {
      logger.info('Fetching all users');
      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
          updated_at: users.updated_at
        })
        .from(users);

      logger.info(`Successfully fetched ${allUsers.length} users`);
      return allUsers;
    } catch (error) {
      logger.error('Error fetching all users', { error: error.message });
      throw new Error('Failed to fetch users');
    }
  },

  /**
   * Retrieves a user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object without password or null if not found
   */
  getUserById: async (id) => {
    try {
      logger.info('Fetching user by ID', { id });
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid user ID provided');
      }

      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
          updated_at: users.updated_at
        })
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (!user) {
        logger.warn('User not found', { id });
        return null;
      }

      logger.info('Successfully fetched user by ID', { id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID', { id, error: error.message });
      throw new Error('Failed to fetch user');
    }
  },

  /**
   * Updates a user's information
   * @param {number} id - User ID
   * @param {Object} updateData - Object containing fields to update
   * @returns {Promise<Object>} Updated user object without password
   */
  updateUser: async (id, updateData) => {
    try {
      logger.info('Updating user', { id, fields: Object.keys(updateData) });

      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid user ID provided');
      }

      // Check if user exists
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Prepare update object
      const updates = {};
      const allowedFields = ['name', 'email', 'role', 'password'];
      
      // Validate and prepare update fields
      for (const [key, value] of Object.entries(updateData)) {
        if (!allowedFields.includes(key)) {
          logger.warn('Invalid field in update data', { field: key });
          continue;
        }

        if (value !== undefined && value !== null && value !== '') {
          if (key === 'password') {
            // Hash password if it's being updated
            updates[key] = await bcrypt.hash(value, saltRounds);
            logger.info('Password will be updated for user', { id });
          } else if (key === 'email') {
            // Check if email is already taken by another user
            const [emailExists] = await db
              .select({ id: users.id })
              .from(users)
              .where(eq(users.email, value))
              .limit(1);

            if (emailExists && emailExists.id !== parseInt(id)) {
              throw new Error('Email is already taken by another user');
            }
            updates[key] = value;
          } else {
            updates[key] = value;
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No valid fields provided for update');
      }

      // Add update timestamp
      updates.updated_at = new Date();

      // Perform the update
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, parseInt(id)))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
          updated_at: users.updated_at
        });

      logger.info('User updated successfully', { 
        id, 
        email: updatedUser.email,
        updatedFields: Object.keys(updates)
      });
      
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user', { id, error: error.message });
      throw error;
    }
  },

  /**
   * Deletes a user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user was deleted successfully
   */
  deleteUser: async (id) => {
    try {
      logger.info('Deleting user', { id });

      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid user ID provided');
      }

      // Check if user exists
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Perform the deletion
      await db
        .delete(users)
        .where(eq(users.id, parseInt(id)));

      logger.info('User deleted successfully', { 
        id, 
        email: existingUser.email 
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting user', { id, error: error.message });
      throw error;
    }
  },

  /**
   * Creates a new user (alias for auth service compatibility)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  createUser: async (userData) => {
    try {
      logger.info('Creating new user', { email: userData.email });
      
      const { email, password, name, role = 'user' } = userData;

      // Validate required fields
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      // Check if user already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name,
          role,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
          updated_at: users.updated_at
        });

      logger.info('User created successfully', { 
        id: newUser.id, 
        email: newUser.email 
      });
      
      return newUser;
    } catch (error) {
      logger.error('Error creating user', { 
        email: userData?.email, 
        error: error.message 
      });
      throw error;
    }
  }
};

export default userService;