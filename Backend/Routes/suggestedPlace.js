const express = require("express");
const router = express.Router();
const SuggestedPlaceController = require("../Controllers/SuggestedPlaceController");
const adminOnly = require("../Middleware/adminOnly");

// NOTE: You must have authentication middleware that sets req.user before this for adminOnly to work!
router.post("/", adminOnly, SuggestedPlaceController.addSuggestedPlace);
// GET: All users can fetch
router.get("/", SuggestedPlaceController.getSuggestedPlaces);

module.exports = router;
