require("dotenv").config();
//starting point of backend
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const connectDB = require("./Db/connect");
const authRoutes = require("./Routes/auth");

// Connect to MongoDB
connectDB();

//middlewares
app.use(cors());
app.use(bodyParser.json());
// Auth routes
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
