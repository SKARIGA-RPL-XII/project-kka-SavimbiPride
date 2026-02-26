const express = require('express');
const router = express.Router();
const listDataUserController = require('../controllers/listDataUserController');
const { verifyToken, isAdmin } = require('../middleware/verifyToken');

router.get("/DataUserAll", listDataUserController.GetAllDataUsers);
router.get("/DataUser/:id", verifyToken, isAdmin, listDataUserController.GetDataUserById);
router.put("/DataUser/:id/status", listDataUserController.changeStatus);

module.exports = router;