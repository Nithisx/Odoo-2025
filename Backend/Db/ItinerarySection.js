const mongoose = require("mongoose");

const itinerarySectionSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    activities: [
      {
        type: String,
        required: true,
      },
    ],
    section: {
      type: Number,
      required: true,
    },
    info: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ItinerarySection", itinerarySectionSchema);
