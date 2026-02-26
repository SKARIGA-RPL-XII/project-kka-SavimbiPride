const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {verifyToken } = require('../middleware/verifyToken');

router.get("/data-pembayaran", verifyToken, paymentController.dataPembayaran);
router.post("/submit", verifyToken, paymentController.submitPembayaran);
router.post("/notification", paymentController.notifyPembayaran);
router.get("/data-pembayaran-offline", verifyToken, paymentController.getDataPembayaranOff);
router.post("/submit-offline", verifyToken, paymentController.submitPembayaranOff);

module.exports = router;