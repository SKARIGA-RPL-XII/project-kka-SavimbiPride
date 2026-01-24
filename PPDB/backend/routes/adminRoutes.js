const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/verifyToken');

router.get('/dashboard-summary', verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Berhasil memuat Data Summary Admin" });
});

module.exports = router;