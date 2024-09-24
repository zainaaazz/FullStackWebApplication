const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { createModule, getAllModules, getModuleById, updateModule, deleteModule } = require('../controllers/moduleController');

const router = express.Router();

// Module CRUD Operations
router.post('/', authenticateJWT(['Admin']), createModule); // Create a new module (Admin only)
router.get('/', authenticateJWT(['Admin', 'Lecturer']), getAllModules); // Retrieve all modules
router.get('/:id', authenticateJWT(['Admin', 'Lecturer']), getModuleById); // Get details of a specific module
router.put('/:id', authenticateJWT(['Admin']), updateModule); // Update module information (Admin only)
router.delete('/:id', authenticateJWT(['Admin']), deleteModule); // Delete a module (Admin only)

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The module ID
 *         moduleCode:
 *           type: string
 *           description: The unique code of the module
 *         moduleName:
 *           type: string
 *           description: The name of the module
 *         moduleDescription:
 *           type: string
 *           description: The description of the module
 *         lecturerId:
 *           type: integer
 *           description: The ID of the lecturer for the module
 */

/**
 * @swagger
 * /modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleCode:
 *                 type: string
 *               moduleName:
 *                 type: string
 *               moduleDescription:
 *                 type: string
 *               lecturerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module created successfully
 *       500:
 *         description: Error creating module
 *   get:
 *     summary: Retrieve a list of all modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: A list of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       500:
 *         description: Error retrieving modules
 * /modules/{id}:
 *   get:
 *     summary: Get details of a specific module
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The module ID
 *     responses:
 *       200:
 *         description: Module details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module not found
 *       500:
 *         description: Error retrieving module
 *   put:
 *     summary: Update module information
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleCode:
 *                 type: string
 *               moduleName:
 *                 type: string
 *               moduleDescription:
 *                 type: string
 *               lecturerId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated successfully
 *       500:
 *         description: Error updating module
 *   delete:
 *     summary: Delete a module
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The module ID
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *       500:
 *         description: Error deleting module
 */
