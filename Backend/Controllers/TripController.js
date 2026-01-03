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
