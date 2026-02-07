const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/verifyToken');
const upload = require('../middleware/uploadAva');

router.get('/:id', verifyToken, isAdmin, adminController.getIdAdmin);
router.put('/edit/:id', verifyToken, isAdmin, upload.single('foto'), adminController.editAdmin);
router.get('/dashboard-summary', verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Berhasil memuat Data Summary Admin" });
});

module.exports = router;