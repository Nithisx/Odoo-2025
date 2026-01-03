const mongoose = require("mongoose");

const suggestedPlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, // URLs or base64 strings
        required: true,
      },
    ],
    location: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuggestedPlace", suggestedPlaceSchema);
