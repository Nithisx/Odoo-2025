const User = require("../Db/User");
const Trip = require("../Db/Trip");
const mongoose = require("mongoose");

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid user id format." });
    }
    const user = await User.findById(userObjectId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const now = new Date();
    const currentTrips = await Trip.find({
      createdBy: userObjectId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    const pastTrips = await Trip.find({
      createdBy: userObjectId,
      endDate: { $lt: now },
    });
    res.status(200).json({ user, currentTrips, pastTrips });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error." });
  }
};
