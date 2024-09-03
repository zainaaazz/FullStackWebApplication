const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { provideFeedback, getAllFeedback, getFeedbackById } = require('../controllers/feedbackController');

const router = express.Router();

// Feedback Operations
router.post('/', authenticateJWT, provideFeedback); // Provide feedback on a submission (Lecturer only)
router.get('/', authenticateJWT, getAllFeedback); // Retrieve all feedback (Admin, Lecturer, and Student)
router.get('/:id', authenticateJWT, getFeedbackById); // Get details of specific feedback (Admin, Lecturer, and Student)

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The feedback ID
 *         submissionId:
 *           type: integer
 *           description: The ID of the submission
 *         lecturerId:
 *           type: integer
 *           description: The ID of the lecturer providing feedback
 *         feedbackText:
 *           type: string
 *           description: The feedback text
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Provide feedback on a submission
 *     tags: [Feedback]
 *     responses:
 *       201:
 *         description: Feedback provided successfully
 *       500:
 *         description: Error providing feedback
 *   get:
 *     summary: Retrieve a list of all feedback
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: A list of feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Error retrieving feedback
 * /api/feedback/{id}:
 *   get:
 *     summary: Get details of specific feedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Error retrieving feedback
 */
