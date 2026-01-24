const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route untuk Registrasi User baru
router.post('/register', authController.register);

// Route untuk Login (menghasilkan JWT Token)
router.post('/login', authController.login);

module.exports = router;