const express = require("express");
const router = express.Router();
const beritaController = require("../controllers/beritaController");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");
const uploadBer = require("../middleware/uploadBer");

router.get("/", beritaController.getAllBerita);
router.get("/:id", beritaController.getBeritaById);
router.post("/", verifyToken, isAdmin, uploadBer.single("gambar"), beritaController.tambahBerita);
router.put("/:id", verifyToken, isAdmin, uploadBer.single("gambar"), beritaController.editBerita);
router.delete("/:id", verifyToken, isAdmin, beritaController.hapusBerita);

module.exports = router;
