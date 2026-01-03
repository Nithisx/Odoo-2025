const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");

router.get("/profile/:userId", UserController.getUserProfile);

module.exports = router;
