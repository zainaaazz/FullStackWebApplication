const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { uploadVideo, getAllVideos, getVideoById, deleteVideo } = require('../controllers/videoController');
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         VideoID:
 *           type: integer
 *           description: The video ID
 *         VideoTitle:
 *           type: string
 *           description: The title of the video
 *         VideoURL:
 *           type: string
 *           description: The URL of the video in Azure Blob Storage
 *       example:
 *         VideoID: 1
 *         VideoTitle: "Introduction to AI"
 *         VideoURL: "https://hmsvideostorage.blob.core.windows.net/videos/intro_to_ai.mp4"
 */

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Upload a video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The video file to upload
 *               videoTitle:
 *                 type: string
 *                 description: The title of the video
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       500:
 *         description: Server error
 */
router.post('/', authenticateJWT, upload.single('file'), uploadVideo);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Retrieve all videos
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
 *         description: Server error
 */
router.get('/', authenticateJWT, getAllVideos);

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get details of a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the video to retrieve
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateJWT, getVideoById);

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the video to delete
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateJWT, deleteVideo);

module.exports = router;
