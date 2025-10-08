import logger from '#config/logger.js';
import db from "#config/database.js"
import { eq } from 'drizzle-orm';
import { users } from "#models/user.model.js"
import bcrypt from 'bcrypt';

// Helper function to hash password
export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing the password: ${error}`);
    throw new Error('Error hashing password');
  }
};

export const getAllUsers = async () => {
  try {
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

    logger.info(`Retrieved ${allUsers.length} users`);
    return allUsers;
  } catch (error) {
    logger.error(`Error fetching all users: ${error}`);
    throw new Error('Error retrieving users');
  }
};

export const getUserById = async (id) => {
  try {
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
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`Retrieved user with ID: ${id}`);
    return user;
  } catch (error) {
    if (error.message === 'User not found') {
      throw error;
    }
    logger.error(`Error finding user by ID ${id}: ${error}`);
    throw new Error('Error retrieving user');
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    // Prepare update object
    const updateData = { ...updates };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Add updated timestamp
    updateData.updated_at = new Date();

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at
      });

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    logger.info(`User with ID ${id} updated successfully`);
    return updatedUser;
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Failed to update user') {
      throw error;
    }
    logger.error(`Error updating user with ID ${id}: ${error}`);
    throw new Error('Error updating user');
  }
};

export const deleteUser = async (id) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    // Delete user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      });

    if (!deletedUser) {
      throw new Error('Failed to delete user');
    }

    logger.info(`User with ID ${id} deleted successfully`);
    return deletedUser;
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Failed to delete user') {
      throw error;
    }
    logger.error(`Error deleting user with ID ${id}: ${error}`);
    throw new Error('Error deleting user');
  }
};
