const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { downloadFile, streamFile, getAllRoles, updateUserRole } = require('../controllers/utilityController');

const router = express.Router();

// File Handling
router.get('/files/download/:id', downloadFile); // Download a file (Admin, Lecturer, and Student)
router.get('/files/stream/:id', streamFile); // Stream a file (Admin and Lecturer)

// Role-Based Access Control
router.get('/roles', authenticateJWT(['Admin', 'Lecture']), getAllRoles); // Retrieve all roles (Admin and Lecture)
router.put('/roles/:id', authenticateJWT(['Admin', 'Lecture']), updateUserRole); // Update user role (Admin and Lecture)

module.exports = router;
/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     summary: Download a video file using its ID
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The video ID
 *     responses:
 *       200:
 *         description: File download initiated
 *       404:
 *         description: Video not found
 *       500:
 *         description: Error downloading video
 * /api/files/stream/{id}:
 *   get:
 *     summary: Stream a video file using its ID
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The video ID
 *     responses:
 *       200:
 *         description: File streaming initiated
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *               description: The streamed video file.
 *       404:
 *         description: Video not found
 *       500:
 *         description: Error streaming video
 */
