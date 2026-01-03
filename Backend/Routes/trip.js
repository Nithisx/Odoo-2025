const express = require("express");
const router = express.Router();
const TripController = require("../Controllers/TripController");

router.post("/create", TripController.createTrip);
router.get("/user/:userId", TripController.getUserTrips);

module.exports = router;
