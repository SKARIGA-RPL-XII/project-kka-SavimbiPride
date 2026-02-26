const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');
const uploadAva = require('../middleware/uploadAva');
const uploadIjazah = require('../middleware/uploadIjazah');

router.get('/profile/:id', verifyToken, userController.getProfile);
router.put('/profile/update/:id', verifyToken, uploadAva.single('foto'), userController.updateProfile);
router.get('/data', verifyToken, userController.getPendaftaranData);
router.get('/jurusan/all', userController.getJurusan);
router.post('/:id', verifyToken, uploadIjazah.single('foto_ijazah'), userController.pendaftaran);
 
module.exports = router;