const express = require("express");
const router = express.Router();
const { chatWithGemini, evaluateSpeech } = require("../controllers/chatController");

// Path: /api/chat
router.post("/chat", chatWithGemini);
router.post("/evaluate-speech", evaluateSpeech);

module.exports = router;
