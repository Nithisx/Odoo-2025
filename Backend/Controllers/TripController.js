const Trip = require("../Db/Trip");
const mongoose = require("mongoose");

exports.createTrip = async (req, res) => {
  try {
    const {
      startDate,
      placeName,
      endDate,
      numberOfPeople,
      description,
      createdBy,
    } = req.body;
    if (!startDate || !placeName || !endDate || !numberOfPeople || !createdBy) {
      console.log("Missing required fields:", req.body);
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }
    let creatorId;
    try {
      creatorId = new mongoose.Types.ObjectId(createdBy);
    } catch (err) {
      console.error("Invalid createdBy ObjectId:", createdBy);
      return res
        .status(400)
        .json({ message: "Invalid user id format for createdBy." });
    }
    const trip = new Trip({
      startDate,
      placeName,
      endDate,
      numberOfPeople,
      description: description || "",
      createdBy: creatorId,
    });
    await trip.save();
    console.log("Trip created:", trip);
    res.status(201).json({ message: "Trip created successfully.", trip });
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    let creatorId;
    try {
      creatorId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      console.error("Invalid userId ObjectId:", userId);
      return res.status(400).json({ message: "Invalid user id format." });
    }
    const trips = await Trip.find({ createdBy: creatorId });
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Error fetching user trips:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getUserTripsByStatus = async (req, res) => {
  try {
    const { userId, status } = req.params;
    let creatorId;
    try {
      creatorId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      console.error("Invalid userId ObjectId:", userId);
      return res.status(400).json({ message: "Invalid user id format." });
    }
    const now = new Date();
    let query = { createdBy: creatorId };
    if (status === "ongoing") {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (status === "upcoming") {
      query.startDate = { $gt: now };
    } else if (status === "completed") {
      query.endDate = { $lt: now };
    } else {
      return res.status(400).json({
        message: "Invalid status. Use 'ongoing', 'upcoming', or 'completed'.",
      });
    }

    // Multiple filter options from query params
    const { placeName, minPeople, maxPeople, startDate, endDate } = req.query;
    if (placeName) {
      query.placeName = { $regex: placeName, $options: "i" };
    }
    if (minPeople) {
      query.numberOfPeople = {
        ...query.numberOfPeople,
        $gte: Number(minPeople),
      };
    }
    if (maxPeople) {
      query.numberOfPeople = {
        ...query.numberOfPeople,
        $lte: Number(maxPeople),
        ...query.numberOfPeople,
      };
    }
    if (startDate) {
      query.startDate = { ...query.startDate, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.endDate = { ...query.endDate, $lte: new Date(endDate) };
    }

    const trips = await Trip.find(query);
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Error fetching user trips by status:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.searchTrips = async (req, res) => {
  try {
    const { userId, q } = req.query;
    let query = {};
    if (userId) {
      try {
        query.createdBy = new mongoose.Types.ObjectId(userId);
      } catch (err) {
        return res.status(400).json({ message: "Invalid user id format." });
      }
    }
    if (q) {
      query.placeName = { $regex: q, $options: "i" };
    }
    // You can add more search fields here if needed
    const trips = await Trip.find(query);
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Error searching trips:", err);
    res.status(500).json({ message: "Server error." });
  }
};
