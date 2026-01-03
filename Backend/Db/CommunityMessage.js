const mongoose = require("mongoose");

const communityMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trip: {
    type: Object,
    required: true,
  },
  sections: {
    type: Array,
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CommunityMessage", communityMessageSchema);
