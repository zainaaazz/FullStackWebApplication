const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const {
    submitAssignment,
    getAllSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
} = require('../controllers/submissionController');

const router = express.Router();

// Submission Operations
router.post('/', authenticateJWT(['Admin', 'Student']), submitAssignment); // Submit an assignment (Student and Admins)
router.get('/', authenticateJWT(['Admin', 'Lecture']), getAllSubmissions); // Retrieve all submissions (Admin and Lecturer only)
router.get('/:id',authenticateJWT(['Admin', 'Lecture','Student']), authenticateJWT, getSubmissionById); // Get details of a specific submission (Admin, Lecturer, and Student)
router.put('/:id', authenticateJWT(['Admin']),updateSubmission); // Update submission status (Admin only)
router.delete('/:id',authenticateJWT(['Admin', 'Student']),deleteSubmission); // Delete a submission (Admin only)

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         videoId:
 *           type: integer
 *           description: The ID of the video submission
 *         studentId:
 *           type: integer
 *           description: The ID of the student who made the submission
 *         assignmentId:
 *           type: integer
 *           description: The ID of the assignment
 *         submissionText:
 *           type: string
 *           description: The text of the submission
 *         status:
 *           type: string
 *           description: The status of the submission (Submitted or Not Submitted)
 *           enum: 
 *             - Submitted
 *             - Not Submitted
 */

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Submit an assignment
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               assignmentId:
 *                 type: integer
 *               submissionText:
 *                 type: string
 *               videoId:
 *                 type: integer
 *                 description: The ID of the video submission
 *               status:
 *                 type: string
 *                 description: The status of the submission (Submitted or Not Submitted)
 *                 default: Submitted
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *       500:
 *         description: Error submitting assignment
 *   get:
 *     summary: Retrieve a list of all submissions
 *     tags: [Submissions]
 *     responses:
 *       200:
 *         description: A list of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *       500:
 *         description: Error retrieving submissions
 * /submissions/{id}:
 *   get:
 *     summary: Get details of a specific submission
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The submission ID
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Error retrieving submission
 *   put:
 *     summary: Update submission status
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the submission (Submitted or Not Submitted)
 *     responses:
 *       200:
 *         description: Submission status updated successfully
 *       500:
 *         description: Error updating submission status
 *   delete:
 *     summary: Delete a submission
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The submission ID
 *     responses:
 *       200:
 *         description: Submission deleted successfully
 *       500:
 *         description: Error deleting submission
 */
