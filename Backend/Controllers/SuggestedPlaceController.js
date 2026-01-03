const SuggestedPlace = require("../Db/SuggestedPlace");
const mongoose = require("mongoose");

exports.addSuggestedPlace = async (req, res) => {
  try {
    const { name, description, images, location, addedBy } = req.body;
    if (
      !name ||
      !description ||
      !images ||
      !Array.isArray(images) ||
      images.length === 0 ||
      !location ||
      !addedBy
    ) {
      console.log("Missing required fields:", req.body);
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(addedBy);
    } catch (err) {
      console.error("Invalid addedBy ObjectId:", addedBy);
      return res
        .status(400)
        .json({ message: "Invalid user id format for addedBy." });
    }
    const place = new SuggestedPlace({
      name,
      description,
      images,
      location,
      addedBy: userId,
    });
    await place.save();
    console.log("Suggested place added:", place);
    res
      .status(201)
      .json({ message: "Suggested place added successfully.", place });
  } catch (err) {
    console.error("Error adding suggested place:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getSuggestedPlaces = async (req, res) => {
  try {
    const places = await SuggestedPlace.find().populate(
      "addedBy",
      "username role"
    );
    res.status(200).json({ places });
  } catch (err) {
    console.error("Error fetching suggested places:", err);
    res.status(500).json({ message: "Server error." });
  }
};
