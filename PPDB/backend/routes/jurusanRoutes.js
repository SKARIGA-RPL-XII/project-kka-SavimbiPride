const express = require("express");
const router = express.Router();
const jurusanController = require("../controllers/jurusanController");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");
const uploadJus = require("../middleware/uploadJus");

router.get("/", jurusanController.getAllJurusan);
router.get("/:id", jurusanController.getJurusanById);
router.post("/", verifyToken, isAdmin, uploadJus.single("gambar"), jurusanController.tambahJurusan);
router.put("/:id", verifyToken, isAdmin, uploadJus.single("gambar"), jurusanController.editJurusan);
router.delete("/:id", verifyToken, isAdmin, jurusanController.hapusJurusan);

module.exports = router;
