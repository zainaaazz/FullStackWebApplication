const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { createAssignment, getAllAssignments, getAssignmentById, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');

const router = express.Router();

// Assignment CRUD Operations
router.post('/', authenticateJWT, createAssignment); // Create a new assignment (Lecturer only)
router.get('/', authenticateJWT, getAllAssignments); // Retrieve all assignments
router.get('/:id', authenticateJWT, getAssignmentById); // Get details of a specific assignment
router.put('/:id', authenticateJWT, updateAssignment); // Update assignment information (Lecturer only)
router.delete('/:id', authenticateJWT, deleteAssignment); // Delete an assignment (Lecturer only)

module.exports = router;



/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The assignment ID
 *         assignmentTitle:
 *           type: string
 *           description: The title of the assignment
 *         assignmentDescription:
 *           type: string
 *           description: The description of the assignment
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The due date of the assignment
 */

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Assignments]
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       500:
 *         description: Error creating assignment
 *   get:
 *     summary: Retrieve a list of all assignments
 *     tags: [Assignments]
 *     responses:
 *       200:
 *         description: A list of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Assignment'
 *       500:
 *         description: Error retrieving assignments
 * /api/assignments/{id}:
 *   get:
 *     summary: Get details of a specific assignment
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The assignment ID
 *     responses:
 *       200:
 *         description: Assignment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Error retrieving assignment
 *   put:
 *     summary: Update assignment information
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The assignment ID
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       500:
 *         description: Error updating assignment
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The assignment ID
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       500:
 *         description: Error deleting assignment
 */
