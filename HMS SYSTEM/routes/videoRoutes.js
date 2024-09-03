const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { uploadVideo, getAllVideos, getVideoById, deleteVideo } = require('../controllers/videoController');

const router = express.Router();

// Video Operations
router.post('/', authenticateJWT, uploadVideo); // Upload a video (Student only)
router.get('/', authenticateJWT, getAllVideos); // Retrieve all videos (Admin and Lecturer only)
router.get('/:id', authenticateJWT, getVideoById); // Get details of a specific video (Admin and Lecturer only)
router.delete('/:id', authenticateJWT, deleteVideo); // Delete a video (Admin only)

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The video ID
 *         videoTitle:
 *           type: string
 *           description: The title of the video
 *         videoUrl:
 *           type: string
 *           description: The URL of the video
 */

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Upload a video
 *     tags: [Videos]
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       500:
 *         description: Error uploading video
 *   get:
 *     summary: Retrieve a list of all videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: A list of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       500:
 *         description: Error retrieving videos
 * /api/videos/{id}:
 *   get:
 *     summary: Get details of a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Error retrieving video
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       500:
 *         description: Error deleting video
 */
