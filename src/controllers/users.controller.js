import logger from '#config/logger.js';
import {
  getUserSchema,
  updateUserRequestSchema,
  deleteUserRequestSchema,
} from '#validation/users.validation.js';
import { formatValidationError } from '#utils/format.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    logger.info(`Retrieved ${users.length} users`);
    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Get users error', error);
    next(error);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const validationResult = getUserSchema.safeParse({ params: req.params });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data.params;

    const user = await getUserById(id);

    logger.info(`Retrieved user with ID: ${id}`);
    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    logger.error('Get user by ID error', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const validationResult = updateUserRequestSchema.safeParse({
      params: req.params,
      body: req.body,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data.params;
    const updates = validationResult.data.body;

    // Authorization checks
    const currentUser = req.user;

    // Users can only update their own information
    if (currentUser.id !== id && currentUser.role !== 'admin') {
      logger.warn(
        `Unauthorized update attempt by user ${currentUser.id} on user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change user roles
    if (updates.role && currentUser.role !== 'admin') {
      logger.warn(`Unauthorized role change attempt by user ${currentUser.id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    // Prevent users from changing their own role (even admins need separate process)
    if (updates.role && currentUser.id === id) {
      logger.warn(`Self role change attempt by user ${currentUser.id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Users cannot change their own role',
      });
    }

    const updatedUser = await updateUser(id, updates);

    logger.info(
      `User with ID ${id} updated successfully by user ${currentUser.id}`
    );
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Update user error', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The user to update does not exist',
      });
    }
    next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const validationResult = deleteUserRequestSchema.safeParse({
      params: req.params,
    });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data.params;
    const currentUser = req.user;

    // Authorization checks
    // Users can only delete their own account, admins can delete any account
    if (currentUser.id !== id && currentUser.role !== 'admin') {
      logger.warn(
        `Unauthorized delete attempt by user ${currentUser.id} on user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    // Prevent deletion of the last admin (business rule)
    if (currentUser.role === 'admin') {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter(user => user.role === 'admin').length;

      if (adminCount <= 1 && currentUser.id === id) {
        logger.warn(`Last admin deletion attempt by user ${currentUser.id}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete the last administrator account',
        });
      }
    }

    const deletedUser = await deleteUser(id);

    logger.info(
      `User with ID ${id} deleted successfully by user ${currentUser.id}`
    );
    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error('Delete user error', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The user to delete does not exist',
      });
    }
    next(error);
  }
};
