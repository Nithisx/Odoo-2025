const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    placeName: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
