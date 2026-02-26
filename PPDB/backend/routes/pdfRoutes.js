const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { verifyToken } = require('../middleware/verifyToken');

router.get("/bukti", verifyToken, pdfController.downloadBukti);
router.get("/bukti-offline", verifyToken, pdfController.downloadBuktiPembayaran); 

module.exports = router;