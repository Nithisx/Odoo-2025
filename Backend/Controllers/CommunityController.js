const CommunityMessage = require("../Db/CommunityMessage");
const Trip = require("../Db/Trip");
const ItinerarySection = require("../Db/ItinerarySection");
const mongoose = require("mongoose");

exports.addCommunityMessage = async (req, res) => {
  try {
    const { userId, tripId } = req.body;
    if (!userId || !tripId) {
      return res
        .status(400)
        .json({ message: "userId and tripId are required." });
    }
    let userObjectId, tripObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid userId or tripId format." });
    }
    const trip = await Trip.findById(tripObjectId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    const sections = await ItinerarySection.find({ tripId: tripObjectId });
    const totalBudget = sections.reduce((sum, s) => sum + (s.budget || 0), 0);
    const message = new CommunityMessage({
      userId: userObjectId,
      trip,
      sections,
      totalBudget,
    });
    await message.save();
    res
      .status(201)
      .json({ message: "Community message added.", data: message });
  } catch (err) {
    console.error("Error adding community message:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.fetchCommunityMessages = async (req, res) => {
  try {
    const messages = await CommunityMessage.find().populate(
      "userId",
      "username firstName lastName"
    );
    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching community messages:", err);
    res.status(500).json({ message: "Server error." });
  }
};
