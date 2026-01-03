const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllTrips,
  getPopularCities,
  getPopularActivities,
  getUserAnalytics,
  deleteUser,
  createSuggestedPlace,
} = require("../Controllers/AdminController");

// Get all users with trip statistics
router.get("/users", getAllUsers);

// Get all trips with user details
router.get("/trips", getAllTrips);

// Get popular cities analytics
router.get("/analytics/cities", getPopularCities);

// Get popular activities analytics
router.get("/analytics/activities", getPopularActivities);

// Get comprehensive user analytics and trends
router.get("/analytics/overview", getUserAnalytics);

// Delete user (admin only)
router.delete("/users/:userId", deleteUser);
// Create suggested place (admin only)
router.post("/suggested-place", createSuggestedPlace);
module.exports = router;
