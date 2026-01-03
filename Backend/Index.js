require("dotenv").config();
//starting point of backend
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const connectDB = require("./Db/connect");
const authRoutes = require("./Routes/auth");
const tripRoutes = require("./Routes/trip");
const suggestedPlaceRoutes = require("./Routes/suggestedPlace");

// Connect to MongoDB
connectDB();

//middlewares
app.use(cors());
app.use(bodyParser.json());
// Auth routes
app.use("/api/auth", authRoutes);
// Trip routes
app.use("/api/trip", tripRoutes);
// Suggested Place routes
app.use("/api/suggested-place", suggestedPlaceRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
