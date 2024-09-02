const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { getAllUsers, getUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/', authenticateJWT, getAllUsers);
router.get('/:id', authenticateJWT, getUserById);

module.exports = router;
