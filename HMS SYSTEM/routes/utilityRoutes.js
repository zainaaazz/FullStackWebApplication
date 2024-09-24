const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { downloadFile, streamFile, getAllRoles, updateUserRole } = require('../controllers/utilityController');

const router = express.Router();

// File Handling
router.get('/files/download/:id', authenticateJWT, downloadFile); // Download a file (Admin, Lecturer, and Student)
router.get('/files/stream/:id', authenticateJWT, streamFile); // Stream a file (Admin and Lecturer)

// Role-Based Access Control
router.get('/roles', authenticateJWT, getAllRoles); // Retrieve all roles (Admin only)
router.put('/roles/:id', authenticateJWT, updateUserRole); // Update user role (Admin only)

module.exports = router;


/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     summary: Download a file
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The file ID
 *     responses:
 *       200:
 *         description: File download initiated
 *       500:
 *         description: Error downloading file
 * /api/files/stream/{id}:
 *   get:
 *     summary: Stream a file
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The file ID
 *     responses:
 *       200:
 *         description: File streaming initiated
 *       500:
 *         description: Error streaming file
 */
