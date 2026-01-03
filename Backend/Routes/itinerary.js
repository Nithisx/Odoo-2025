const express = require("express");
const router = express.Router();
const ItineraryController = require("../Controllers/ItineraryController");

// Create itinerary sections for a trip (accepts array)
router.post("/create/:tripId", ItineraryController.createSections);
// Get all sections for a trip
router.get("/trip/:tripId", ItineraryController.getSectionsByTrip);

module.exports = router;
