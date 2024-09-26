const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { provideFeedback, getAllFeedback, getFeedbackById, updateFeedback, deleteFeedback } = require('../controllers/feedbackController');

const router = express.Router();

// Feedback Operations
router.post('/', authenticateJWT(['Admin', 'Lecture']), provideFeedback); // Provide feedback on a submission (Lecturer and Admin)
router.get('/', authenticateJWT(['Admin', 'Lecture']), getAllFeedback); // Retrieve all feedback (Admin,  Student)
router.get('/:id',  authenticateJWT(['Admin', 'Lecture']),getFeedbackById); // Get details of specific feedback (Admin, Lecturer)
router.put('/:id', authenticateJWT(['Admin', 'Lecture']),updateFeedback); // Update specific feedback (Lecturer and Admin)
router.delete('/:id', authenticateJWT(['Admin', 'Lecture']),deleteFeedback); // Delete specific feedback (Admin and Lecture)

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         mark:
 *           type: integer
 *           description: Mark given for your submission
 *         submissionId:
 *           type: integer
 *           description: The ID of the submission
 *         lectureId:
 *           type: integer
 *           description: The ID of the lecture associated with the feedback
 *         feedbackText:
 *           type: string
 *           description: The feedback text
 */

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: Provide feedback on a submission
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionId:
 *                 type: integer
 *                 description: ID of the submission
 *               lectureId:
 *                 type: integer
 *                 description: ID of the lecture associated with the feedback
 *               feedbackText:
 *                 type: string
 *                 description: The feedback text
 *               mark:
 *                 type: integer
 *                 description: Mark given for your submission
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
 * /feedbacks/{id}:
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
 *   put:
 *     summary: Update specific feedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedbackText:
 *                 type: string
 *                 description: Updated feedback text
 *               mark:
 *                 type: integer
 *                 description: Updated mark
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Error updating feedback
 *   delete:
 *     summary: Delete specific feedback
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
 *         description: Feedback deleted successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Error deleting feedback
 */
