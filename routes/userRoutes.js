const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/logout', authController.logout);
router.route('/').get(authController.protect, userController.getAllUsers);
router.post('/modifyUsers', userController.modifyUsers);

module.exports = router;
