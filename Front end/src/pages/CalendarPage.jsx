import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const CALENDAR_API_URL = "http://localhost:3000/api/calendar";

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCalendarData();
    fetchUpcomingTrips();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await fetch(
        `${CALENDAR_API_URL}/user/${userId}?year=${year}&month=${month}`
      );
      const data = await response.json();

      if (data.success) {
        setCalendarEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      setError("Failed to load calendar data");
    }
  };

  const fetchUpcomingTrips = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await fetch(
        `${CALENDAR_API_URL}/user/${userId}/upcoming`
      );
      const data = await response.json();

      if (data.success) {
        setUpcomingTrips(data.trips);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch upcoming trips:", error);
      setLoading(false);
    }
  };

  // Calendar utility functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getEventsForDate = (date) => {
    const dateString = formatDate(date);
    return calendarEvents.filter((event) => {
      const startDate = event.startDate;
      const endDate = event.endDate;
      return dateString >= startDate && dateString <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const events = getEventsForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${
            events.length > 0 ? "has-events" : ""
          }`}
        >
          <div className="day-number">{day}</div>
          {events.length > 0 && (
            <div className="events">
              {events.map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className={`event ${
                    event.isMultiDay ? "multi-day" : "single-day"
                  }`}
                  title={`${event.title} (${event.numberOfPeople} people)`}
                >
                  <span className="event-title">{event.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading calendar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Section */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-gray-700"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid grid grid-cols-7">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-600">Single Day Trip</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                  <span className="text-sm text-gray-600">Multi-Day Trip</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Upcoming Trips */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Upcoming Trips
              </h3>
              {upcomingTrips.length === 0 ? (
                <div className="text-center py-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    No upcoming trips in the next 30 days
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip._id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <h4 className="font-medium text-gray-900">
                        {trip.placeName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(trip.startDate).toLocaleDateString()} -{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {trip.numberOfPeople} people
                      </p>
                      {trip.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {trip.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                This Month
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Trips</span>
                  <span className="font-semibold text-gray-900">
                    {calendarEvents.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Multi-day Trips</span>
                  <span className="font-semibold text-gray-900">
                    {calendarEvents.filter((event) => event.isMultiDay).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Single-day Trips
                  </span>
                  <span className="font-semibold text-gray-900">
                    {calendarEvents.filter((event) => !event.isMultiDay).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .calendar-day {
          min-height: 100px;
          padding: 8px;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
        }

        .calendar-day.empty {
          background-color: #f9fafb;
        }

        .calendar-day.today {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
        }

        .calendar-day.has-events {
          background-color: #fef7ff;
        }

        .day-number {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .events {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event {
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 3px;
          color: white;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .event.single-day {
          background-color: #8b5cf6;
        }

        .event.multi-day {
          background-color: #6366f1;
        }

        .event-title {
          display: block;
        }
      `}</style>
    </div>
  );
}

export default CalendarPage;
