module.exports = (req, res, next) => {
  if (!req.body.addedBy || !req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can perform this action." });
  }
  next();
};
