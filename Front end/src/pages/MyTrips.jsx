import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:3000/api/trip";

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: "all", // all, upcoming, ongoing, completed
    minPeople: "",
    maxPeople: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleTripClick = (tripId) => {
    navigate(`/itinerary/${tripId}`);
  };

  const fetchTrips = async () => {
    setLoading(true);
    setError("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    try {
      let url;
      let queryParams = new URLSearchParams();

      // If there's search text, use search endpoint
      if (searchText.trim()) {
        url = `${API_BASE_URL}/search`;
        queryParams.append("userId", userId);
        queryParams.append("q", searchText.trim());
      } else {
        // Use filtered endpoint if status is not 'all'
        if (filters.status !== "all") {
          url = `${API_BASE_URL}/user/${userId}/${filters.status}`;
        } else {
          url = `${API_BASE_URL}/user/${userId}`;
        }

        // Add filter parameters
        if (filters.minPeople)
          queryParams.append("minPeople", filters.minPeople);
        if (filters.maxPeople)
          queryParams.append("maxPeople", filters.maxPeople);
        if (filters.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);
      }

      const queryString = queryParams.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(finalUrl);
      const data = await response.json();

      setTrips(data.trips || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      minPeople: "",
      maxPeople: "",
      startDate: "",
      endDate: "",
    });
    setSearchText("");
  };

  const getStatusBadge = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    if (endDate < now) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Completed
        </span>
      );
    } else if (startDate <= now && endDate >= now) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Ongoing
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Upcoming
        </span>
      );
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filters]); // Re-fetch when filters change

  return (
    <div className="min-h-screen bg-gray-25">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Trips
              </h1>
              <p className="text-gray-600">
                Manage and explore all your travel adventures
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/plan-trip")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Trip
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search & Filter Your Trips
          </h3>
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search trips by destination..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                />
                <svg
                  className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Search
              </button>
              {(searchText ||
                Object.values(filters).some((v) => v && v !== "all")) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Advanced Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                >
                  <option value="all">All Trips</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum People
                </label>
                <input
                  type="number"
                  value={filters.minPeople}
                  onChange={(e) =>
                    handleFilterChange("minPeople", e.target.value)
                  }
                  min="1"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  placeholder="Min travelers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum People
                </label>
                <input
                  type="number"
                  value={filters.maxPeople}
                  onChange={(e) =>
                    handleFilterChange("maxPeople", e.target.value)
                  }
                  min="1"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  placeholder="Max travelers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Until)
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}
        {/* Trip Results Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {trips.length > 0 ? `Your Trips (${trips.length})` : "Your Trips"}
            </h3>
            {trips.length > 0 && (
              <div className="text-sm text-gray-600">
                {
                  trips.filter((trip) => {
                    const now = new Date();
                    const endDate = new Date(trip.endDate);
                    return endDate >= now;
                  }).length
                }{" "}
                active trips
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                No trips found
              </h4>
              <p className="text-gray-600 mb-6">
                Start planning your next adventure!
              </p>
              <button
                onClick={() => navigate("/plan-trip")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Plan Your First Trip
              </button>
            </div>
          )}
          <div className="grid gap-6">
            {trips.map((trip) => {
              const now = new Date();
              const startDate = new Date(trip.startDate);
              const endDate = new Date(trip.endDate);
              let statusColor = "gray";
              let statusBg = "gray-50";

              if (endDate < now) {
                statusColor = "gray";
                statusBg = "gray-50";
              } else if (startDate <= now && endDate >= now) {
                statusColor = "green";
                statusBg = "green-50";
              } else {
                statusColor = "blue";
                statusBg = "blue-50";
              }

              return (
                <div
                  key={trip._id}
                  onClick={() => handleTripClick(trip._id)}
                  className={`border border-gray-100 rounded-xl p-6 bg-${statusBg} hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all duration-200 group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 bg-${statusColor}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <svg
                          className={`w-6 h-6 text-${statusColor}-600`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {trip.placeName}
                          </h4>
                          {getStatusBadge(trip)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {new Date(trip.startDate).toLocaleDateString()} -{" "}
                              {new Date(trip.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0A2.5 2.5 0 0021 15c0-1.38-.5-2-1.5-2s-1.5.62-1.5 2c0 .38.1.74.25 1.05M18.75 9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                              />
                            </svg>
                            <span>{trip.numberOfPeople} travelers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0"
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
                  </div>

                  {trip.description && (
                    <div className="bg-white/60 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {trip.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Created {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                      {trip.updatedAt !== trip.createdAt && (
                        <span>
                          • Updated{" "}
                          {new Date(trip.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-purple-600 font-medium group-hover:text-purple-700">
                      Manage Itinerary →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
