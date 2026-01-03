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
    const upcomingTrips = await Trip.find({
      createdBy: userObjectId,
      startDate: { $gt: now },
    });
    const pastTrips = await Trip.find({
      createdBy: userObjectId,
      endDate: { $lt: now },
    });
    res.status(200).json({ user, upcomingTrips, pastTrips });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Validate userId format
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid user id format." });
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.__v;

    // Check if username is being updated and if it's unique
    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: userObjectId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists." });
      }
    }

    // Check if email is being updated and if it's unique
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userObjectId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(userObjectId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ message: "Server error." });
  }
};
