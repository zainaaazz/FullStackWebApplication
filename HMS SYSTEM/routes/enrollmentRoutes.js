const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { enrollStudent, getAllEnrollments, removeEnrollment } = require('../controllers/enrollmentController');

const router = express.Router();

// Module Enrollment
router.post('/', authenticateJWT(['Admin', 'Lecturer']), enrollStudent); // Enroll a student in a module (Admin or Lecturer)
router.get('/', authenticateJWT(['Admin', 'Lecturer', 'Student']), getAllEnrollments); // Retrieve all enrollments
router.delete('/:id', authenticateJWT(['Admin', 'Lecturer']), removeEnrollment); // Remove a student from a module (Admin or Lecturer)

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         StudentID:
 *           type: integer
 *           description: The ID of the student
 *         ModuleID:
 *           type: integer
 *           description: The ID of the module
 *     EnrollRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - moduleId
 *       properties:
 *         studentId:
 *           type: integer
 *           description: The ID of the student to enroll
 *         moduleId:
 *           type: integer
 *           description: The ID of the module to enroll the student in
 */

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student in a module
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollRequest'
 *     responses:
 *       201:
 *         description: Student enrolled successfully
 *       500:
 *         description: Error enrolling student
 *   get:
 *     summary: Retrieve a list of all enrollments
 *     tags: [Enrollments]
 *     responses:
 *       200:
 *         description: A list of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       500:
 *         description: Error retrieving enrollments
 * /enrollments/{id}:
 *   delete:
 *     summary: Remove a student from a module
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment removed successfully
 *       500:
 *         description: Error removing enrollment
 */
