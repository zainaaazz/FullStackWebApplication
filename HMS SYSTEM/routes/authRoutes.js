const express = require('express');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

// Updated to allow registration without Admin authentication
router.post('/register',authenticateJWT(['Admin']),register);
router.post('/login', login);
router.post('/logout', logout);

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: |
 *       Registers a new user with the provided user number, password, first name, last name, email, course ID, and role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserNumber:
 *                 type: integer
 *                 example: 22345678
 *               Password:
 *                 type: string
 *                 example: securepassword123
 *               FirstName:
 *                 type: string
 *                 example: John
 *               LastName:
 *                 type: string
 *                 example: Doe
 *               Email:
 *                 type: string
 *                 example: johndoe@example.com
 *               CourseID:
 *                 type: integer
 *                 example: 1
 *               UserRole:
 *                 type: string
 *                 example: 'Student'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered
 *       400:
 *         description: Invalid UserNumber
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid UserNumber
 *       500:
 *         description: Error registering user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error registering user
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in a user
 *     description: |
 *       Authenticates a user and returns an access token if credentials are valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserNumber:
 *                 type: integer
 *                 example: 42345678
 *               Password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Access token successfully issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: your_jwt_token_here
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Error logging in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error logging in
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out a user
 *     description: |
 *       Logs out the user. Note: Logout functionality is usually handled on the client side.
 *     responses:
 *       200:
 *         description: User successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out
 */

module.exports = router;
