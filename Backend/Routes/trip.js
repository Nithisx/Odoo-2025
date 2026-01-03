const express = require("express");
const router = express.Router();
const TripController = require("../Controllers/TripController");

router.post("/create", TripController.createTrip);
router.get("/user/:userId", TripController.getUserTrips);
router.get("/user/:userId/:status", TripController.getUserTripsByStatus);
router.get("/search", TripController.searchTrips);

module.exports = router;
