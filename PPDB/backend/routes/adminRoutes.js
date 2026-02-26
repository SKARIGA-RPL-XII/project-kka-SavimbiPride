const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/verifyToken');
const uploadAva = require('../middleware/uploadAva');

router.get('/profile/:id', verifyToken, isAdmin, adminController.getIdAdmin);
router.put('/profile/update/:id', verifyToken, isAdmin, uploadAva.single('foto'), adminController.editAdmin);
router.get('/data-summary', verifyToken, isAdmin, adminController.dataSummary);
router.get('/data-bayar', verifyToken, isAdmin, adminController.getDataBayar);

router.get('/config-harga', verifyToken, isAdmin, adminController.getConfigHarga);
router.put('/config-harga', verifyToken, isAdmin, adminController.saveConfigHarga);

router.put('/verifikasi-bayar/:id', verifyToken, isAdmin, adminController.lunas);

module.exports = router;