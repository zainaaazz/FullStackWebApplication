const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();

// Course CRUD Operations
router.post('/', authenticateJWT, createCourse); // Create a new course (Admin only)
router.get('/', authenticateJWT, getAllCourses); // Retrieve all courses
router.get('/:id', authenticateJWT, getCourseById); // Get details of a specific course
router.put('/:id', authenticateJWT, updateCourse); // Update course information (Admin only)
router.delete('/:id', authenticateJWT, deleteCourse); // Delete a course (Admin only)

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The course ID
 *         courseName:
 *           type: string
 *           description: The name of the course
 *         courseDescription:
 *           type: string
 *           description: The description of the course
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     responses:
 *       201:
 *         description: Course created successfully
 *       500:
 *         description: Error creating course
 *   get:
 *     summary: Retrieve a list of all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Error retrieving courses
 * /api/courses/{id}:
 *   get:
 *     summary: Get details of a specific course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Error retrieving course
 *   put:
 *     summary: Update course information
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       500:
 *         description: Error updating course
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       500:
 *         description: Error deleting course
 */
