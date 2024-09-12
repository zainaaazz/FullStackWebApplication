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
 *         title:
 *           type: string
 *           description: The title of the assignment
 *         instructions:
 *           type: string
 *           description: Instructions for the assignment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the assignment was created
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The due date of the assignment
 *         ModuleID:
 *           type: integer
 *           description: The ID of the module course
 *       required:
 *         - title
 *         - dueDate
 *         - ModuleID
 *   requestBodies:
 *     AssignmentRequestBody:
 *       description: The body of the request for creating or updating an assignment
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the assignment
 *               instructions:
 *                 type: string
 *                 description: Instructions for the assignment
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: The due date of the assignment
 *               ModuleID:
 *                 type: integer
 *                 description: The ID of the module course
 *             required:
 *               - title
 *               - dueDate
 *               - ModuleID
 *   responses:
 *     AssignmentCreated:
 *       description: Assignment created successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     AssignmentUpdated:
 *       description: Assignment updated successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     AssignmentDeleted:
 *       description: Assignment deleted successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 * */

/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Assignments]
 *     requestBody:
 *       $ref: '#/components/requestBodies/AssignmentRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/AssignmentCreated'
 *       400:
 *         description: Bad request, invalid data
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
 * /assignments/{id}:
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
 *     requestBody:
 *       $ref: '#/components/requestBodies/AssignmentRequestBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AssignmentUpdated'
 *       400:
 *         description: Bad request, invalid data
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
 *         $ref: '#/components/responses/AssignmentDeleted'
 *       500:
 *         description: Error deleting assignment
 * */
