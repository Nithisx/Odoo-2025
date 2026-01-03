const User = require("../Db/User");
const Trip = require("../Db/Trip");
const ItinerarySection = require("../Db/ItinerarySection");
const CommunityMessage = require("../Db/CommunityMessage");
const SuggestedPlace = require("../Db/SuggestedPlace");
const mongoose = require("mongoose");

// Get all users with their trip counts
const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "userId",
          as: "trips",
        },
      },
      {
        $addFields: {
          tripCount: { $size: "$trips" },
          completedTrips: {
            $size: {
              $filter: {
                input: "$trips",
                as: "trip",
                cond: { $eq: ["$$trip.isCompleted", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          trips: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get all trips with user details
const getAllTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let matchCondition = {};
    if (status) {
      matchCondition.isCompleted = status === "completed";
    }

    const trips = await Trip.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          placeName: 1,
          startDate: 1,
          endDate: 1,
          numberOfPeople: 1,
          description: 1,
          isCompleted: 1,
          createdAt: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalTrips = await Trip.countDocuments(matchCondition);

    res.status(200).json({
      success: true,
      trips,
      totalTrips,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTrips / limit),
    });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};

// Get popular cities based on trip frequency
const getPopularCities = async (req, res) => {
  try {
    const popularCities = await Trip.aggregate([
      {
        $group: {
          _id: "$placeName",
          visitCount: { $sum: 1 },
          totalPeople: { $sum: "$numberOfPeople" },
          avgPeople: { $avg: "$numberOfPeople" },
          lastVisit: { $max: "$startDate" },
        },
      },
      {
        $sort: { visitCount: -1 },
      },
      {
        $limit: 15,
      },
      {
        $project: {
          city: "$_id",
          visitCount: 1,
          totalPeople: 1,
          avgPeople: { $round: ["$avgPeople", 1] },
          lastVisit: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      cities: popularCities,
    });
  } catch (error) {
    console.error("Popular cities error:", error);
    res.status(500).json({ message: "Failed to fetch popular cities" });
  }
};

// Get popular activities from itinerary sections
const getPopularActivities = async (req, res) => {
  try {
    const popularActivities = await ItinerarySection.aggregate([
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
          avgBudget: { $avg: "$budget" },
          locations: { $addToSet: "$location" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          activity: "$_id",
          count: 1,
          totalBudget: 1,
          avgBudget: { $round: ["$avgBudget", 0] },
          uniqueLocations: { $size: "$locations" },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      activities: popularActivities,
    });
  } catch (error) {
    console.error("Popular activities error:", error);
    res.status(500).json({ message: "Failed to fetch popular activities" });
  }
};

// Get comprehensive analytics and trends
const getUserAnalytics = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const last6Months = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 6,
      1
    );
    const lastYear = new Date(
      currentDate.getFullYear() - 1,
      currentDate.getMonth(),
      1
    );

    // Monthly user registration trends
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last6Months },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Trip creation trends
    const tripTrends = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: last6Months },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalPeople: { $sum: "$numberOfPeople" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Overall statistics
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ isCompleted: true });
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth },
    });
    const totalItinerarySections = await ItinerarySection.countDocuments();
    const totalCommunityMessages = await CommunityMessage.countDocuments();

    // Budget analytics
    const budgetAnalytics = await ItinerarySection.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$budget" },
          avgBudget: { $avg: "$budget" },
          maxBudget: { $max: "$budget" },
          minBudget: { $min: "$budget" },
        },
      },
    ]);

    // Trip duration analytics
    const durationAnalytics = await Trip.aggregate([
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ["$endDate", "$startDate"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" },
          maxDuration: { $max: "$duration" },
          minDuration: { $min: "$duration" },
        },
      },
    ]);

    // Group size analytics
    const groupSizeAnalytics = await Trip.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ["$numberOfPeople", 1] }, then: "Solo" },
                { case: { $lte: ["$numberOfPeople", 2] }, then: "Couple" },
                { case: { $lte: ["$numberOfPeople", 4] }, then: "Small Group" },
                {
                  case: { $lte: ["$numberOfPeople", 8] },
                  then: "Medium Group",
                },
              ],
              default: "Large Group",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalTrips,
          completedTrips,
          activeUsers,
          totalItinerarySections,
          totalCommunityMessages,
          completionRate:
            totalTrips > 0
              ? ((completedTrips / totalTrips) * 100).toFixed(1)
              : 0,
        },
        trends: {
          userRegistrations: userTrends,
          tripCreations: tripTrends,
        },
        budget: budgetAnalytics[0] || {
          totalBudget: 0,
          avgBudget: 0,
          maxBudget: 0,
          minBudget: 0,
        },
        duration: durationAnalytics[0] || {
          avgDuration: 0,
          maxDuration: 0,
          minDuration: 0,
        },
        groupSizes: groupSizeAnalytics,
      },
    });
  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Also delete user's trips and related data
    await Trip.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    await CommunityMessage.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Create suggested place (admin only)
const createSuggestedPlace = async (req, res) => {
  try {
    const { name, description, images, location, addedBy } = req.body;

    if (!name || !description || !location || !addedBy) {
      return res.status(400).json({
        message: "Name, description, location, and addedBy are required",
      });
    }

    // Verify the addedBy user exists and is admin
    const adminUser = await User.findById(addedBy);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        message: "Only admin users can create suggested places",
      });
    }

    const suggestedPlace = new SuggestedPlace({
      name,
      description,
      images: images || [],
      location,
      addedBy: new mongoose.Types.ObjectId(addedBy),
    });

    const savedPlace = await suggestedPlace.save();

    res.status(201).json({
      success: true,
      message: "Suggested place created successfully",
      place: savedPlace,
    });
  } catch (error) {
    console.error("Create suggested place error:", error);
    res.status(500).json({ message: "Failed to create suggested place" });
  }
};

module.exports = {
  getAllUsers,
  getAllTrips,
  getPopularCities,
  getPopularActivities,
  getUserAnalytics,
  deleteUser,
  createSuggestedPlace,
};
