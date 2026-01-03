const User = require("../Db/User");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, profilePic, firstName, lastName, phoneNumber, city, country } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !phoneNumber || !city || !country) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profilePic: profilePic || '',
      firstName,
      lastName,
      phoneNumber,
      city,
      country
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    res.status(200).json({ message: "Login successful." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
