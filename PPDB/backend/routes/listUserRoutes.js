const express = require('express');
const router = express.Router();
const listUserController = require('../controllers/listUserController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', verifyToken, listUserController.GetAllUsers);
router.delete('/:id', verifyToken, listUserController.DeleteUser);
router.put('/reset/:id', verifyToken, listUserController.ResetUserPassword);
router.get('/calon',  verifyToken, listUserController.calonSiswa);

module.exports = router;