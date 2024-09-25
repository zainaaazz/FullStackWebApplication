const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Existing routes - restricted to Admin
router.get('/', authenticateJWT(['Admin']), getAllUsers);
router.get('/:id', authenticateJWT(['Admin']), getUserById);

// Update and delete user routes - restricted to Admin
router.put('/:id', authenticateJWT(['Admin']), updateUser);
router.delete('/:id', authenticateJWT(['Admin']), deleteUser);

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *       type: object
 *       properties:
*         Username:
 *             type: string
 *             description:The assinged username for user
 *        FirstName:
 *             type: string
 *             description: The name of the user
 *        LastName:
 *             type: string
 *             description:The surname of the user
 *        Email:
 *             type: string
 *             description:Users email 
 *        UserRole:
 *             type: string
 *             description:The users role 
 *        CourseID:
 *             type: integer
 *             description:The course ID enrolled to the user
 */



/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of all users (Admins only)
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
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error retrieving users
 * /users/{id}:
 *   get:
 *     summary: Get details of a specific user (Admins only)
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
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving user
 *   put:
 *     summary: Update user details (Admins only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *               FirstName:
 *                 type: string
 *               LastName:
 *                 type: string
 *               Email:
 *                 type: string
 *               UserRole:
 *                 type: string
 *               CourseID:
 *                 type: integer
 *             required:
 *               - Username
 *               - FirstName
 *               - LastName
 *               - Email
 *               - UserRole
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error updating user
 *   delete:
 *     summary: Delete a user (Admins only)
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
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error deleting user
 */
