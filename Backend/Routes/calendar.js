const express = require("express");
const router = express.Router();
const {
  getCalendarData,
  getUpcomingTrips,
} = require("../Controllers/CalendarController");

// Get calendar data for a specific user and month
router.get("/user/:userId", getCalendarData);

// Get upcoming trips for a user
router.get("/user/:userId/upcoming", getUpcomingTrips);

module.exports = router;
