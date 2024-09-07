const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { addModuleToCourse, removeModuleFromCourse } = require('../controllers/moduleOnCourseController');

const router = express.Router();

// Module on Course Management
router.post('/', authenticateJWT, addModuleToCourse); // Add a module to a course (Admin only)
router.delete('/:id', authenticateJWT, removeModuleFromCourse); // Remove a module from a course (Admin only)

module.exports = router;


/**
 * @swagger
 * /api/module-on-course:
 *   post:
 *     summary: Add a module to a course
 *     tags: [Modules on Courses]
 *     responses:
 *       201:
 *         description: Module added to course successfully
 *       500:
 *         description: Error adding module to course
 * /api/module-on-course/{id}:
 *   delete:
 *     summary: Remove a module from a course
 *     tags: [Modules on Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the module on course relationship
 *     responses:
 *       200:
 *         description: Module removed from course successfully
 *       500:
 *         description: Error removing module from course
 */
