const ItinerarySection = require("../Db/ItinerarySection");
const mongoose = require("mongoose");

exports.createSections = async (req, res) => {
  try {
    const { tripId } = req.params;
    const sections = req.body;
    if (!tripId || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        message: "tripId param and sections array in body are required.",
      });
    }
    let tripObjectId;
    try {
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid trip id format." });
    }

    // Delete existing sections for this trip first
    await ItinerarySection.deleteMany({ tripId: tripObjectId });

    const docs = sections.map((s) => ({
      tripId: tripObjectId,
      section: s.section,
      startDate: s.startDate,
      endDate: s.endDate,
      place: s.place,
      activities: s.activities,
      budget: s.budget || 0,
      info: s.info || "",
    }));
    const inserted = await ItinerarySection.insertMany(docs);
    res
      .status(201)
      .json({ message: "Sections created successfully.", sections: inserted });
  } catch (err) {
    console.error("Error creating itinerary sections:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getSectionsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    let tripObjectId;
    try {
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid trip id format." });
    }
    const sections = await ItinerarySection.find({ tripId: tripObjectId });
    // Calculate totals
    const totalBudget = sections.reduce((sum, s) => sum + (s.budget || 0), 0);
    const uniquePlaces = new Set(sections.map((s) => s.place));
    const allActivities = sections.flatMap((s) =>
      Array.isArray(s.activities) ? s.activities : []
    );
    const uniqueActivities = new Set(allActivities);
    let minDate = null,
      maxDate = null;
    sections.forEach((s) => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      if (!minDate || start < minDate) minDate = start;
      if (!maxDate || end > maxDate) maxDate = end;
    });
    let daysCovered = 0;
    if (minDate && maxDate) {
      daysCovered = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    res.status(200).json({
      sections,
      totalBudget,
      totalPlaces: uniquePlaces.size,
      totalActivities: uniqueActivities.size,
      daysCovered,
    });
  } catch (err) {
    console.error("Error fetching itinerary sections:", err);
    res.status(500).json({ message: "Server error." });
  }
};
