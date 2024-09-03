const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { getAllUsers, getUserById, registerUser, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Existing routes
router.get('/', authenticateJWT, getAllUsers);
router.get('/:id', authenticateJWT, getUserById);

// New user management routes
router.post('/', authenticateJWT, registerUser);  // Register a new user
router.put('/:id', authenticateJWT, updateUser);  // Update user details
router.delete('/:id', authenticateJWT, deleteUser);  // Delete a user

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The user's username
 *         userRole:
 *           type: string
 *           description: The user's role
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Error registering user
 *   get:
 *     summary: Get a list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error retrieving users
 * /api/users/{id}:
 *   get:
 *     summary: Get details of a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving user
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Error updating user
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Error deleting user
 */
