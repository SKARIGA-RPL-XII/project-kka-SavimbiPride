const express = require("express");
const router = express.Router();
const jurusanController = require("../controllers/jurusanController");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");
const upload = require("../middleware/uploadJus");

router.get("/", jurusanController.getAllJurusan);
router.get("/:id", jurusanController.getJurusanById);
router.post("/", verifyToken, isAdmin, upload.single("gambar"), jurusanController.tambahJurusan);
router.put("/:id", verifyToken, isAdmin, upload.single("gambar"), jurusanController.editJurusan);
router.delete("/:id", verifyToken, isAdmin, jurusanController.hapusJurusan);

module.exports = router;
