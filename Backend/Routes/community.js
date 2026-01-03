const express = require("express");
const router = express.Router();
const CommunityController = require("../Controllers/CommunityController");

router.post("/add", CommunityController.addCommunityMessage);
router.get("/fetch", CommunityController.fetchCommunityMessages);

module.exports = router;
