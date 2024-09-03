const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { enrollStudent, getAllEnrollments, removeEnrollment } = require('../controllers/enrollmentController');

const router = express.Router();

// Module Enrollment
router.post('/', authenticateJWT, enrollStudent); // Enroll a student in a module (Admin or Lecturer only)
router.get('/', authenticateJWT, getAllEnrollments); // Retrieve all enrollments (Admin, Lecturer, and Student)
router.delete('/:id', authenticateJWT, removeEnrollment); // Remove a student from a module (Admin or Lecturer only)

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The enrollment ID
 *         studentId:
 *           type: integer
 *           description: The ID of the student
 *         moduleId:
 *           type: integer
 *           description: The ID of the module
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll a student in a module
 *     tags: [Enrollments]
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
 * /api/enrollments/{id}:
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
