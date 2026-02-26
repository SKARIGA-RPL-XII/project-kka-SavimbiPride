const express = require('express');
const router = express.Router();
const inboxController = require('../controllers/inboxController');
const {verifyToken, isAdmin } = require('../middleware/verifyToken');

router.get("/inbox/:userId", verifyToken, inboxController.GetInboxByUserId);
router.post("/inboxKirim",verifyToken,  isAdmin, inboxController.inbox);
router.put("/markAsRead/:id", verifyToken, inboxController.markAsRead);
router.get("/status/:userId", verifyToken, inboxController.status);

module.exports = router;