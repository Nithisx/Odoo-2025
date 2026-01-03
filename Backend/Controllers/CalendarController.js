const Trip = require("../Db/Trip");
const mongoose = require("mongoose");

// Get calendar data with trip dates for a user
const getCalendarData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Build date filter for the requested month/year or current month if not specified
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // month is 0-indexed

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    // Find trips that overlap with the requested month
    const trips = await Trip.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        {
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        },
      ],
    }).select("placeName startDate endDate description numberOfPeople");

    // Format trips for calendar display
    const calendarEvents = trips.map((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);

      return {
        id: trip._id,
        title: trip.placeName,
        startDate: start.toISOString().split("T")[0], // YYYY-MM-DD format
        endDate: end.toISOString().split("T")[0],
        description: trip.description,
        numberOfPeople: trip.numberOfPeople,
        isMultiDay: start.toDateString() !== end.toDateString(),
      };
    });

    res.status(200).json({
      success: true,
      month: targetMonth + 1, // Convert back to 1-indexed
      year: targetYear,
      events: calendarEvents,
    });
  } catch (error) {
    console.error("Calendar data error:", error);
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
};

// Get upcoming trips (next 30 days)
const getUpcomingTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingTrips = await Trip.find({
      userId: new mongoose.Types.ObjectId(userId),
      startDate: {
        $gte: today,
        $lte: thirtyDaysFromNow,
      },
    })
      .sort({ startDate: 1 })
      .select("placeName startDate endDate description numberOfPeople");

    res.status(200).json({
      success: true,
      trips: upcomingTrips,
    });
  } catch (error) {
    console.error("Upcoming trips error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming trips" });
  }
};

module.exports = {
  getCalendarData,
  getUpcomingTrips,
};
