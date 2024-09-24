const express = require('express');
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();

// Define routes for courses
router.get('/', getAllCourses);  // Get all courses
router.get('/:id', getCourseById);  // Get a specific course by ID
router.post('/', createCourse);  // Create a new course
router.put('/:id', updateCourse);  // Update course details
router.delete('/:id', deleteCourse);  // Delete a course

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
 *         courseCode:
 *           type: string
 *           description: The unique course code
 *         courseName:
 *           type: string
 *           description: The course name
 *         duration:
 *           type: integer
 *           description: Duration of the course in years
 *         year:
 *           type: integer
 *           description: The academic year the course is offered
 */

/**
 * @swagger
 * /courses:
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
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       500:
 *         description: Error creating course
 * 
 * /courses/{id}:
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
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
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
