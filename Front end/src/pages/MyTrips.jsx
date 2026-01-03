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
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Trips</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search trips by place name..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
            {(searchText ||
              Object.values(filters).some((v) => v && v !== "all")) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Trips</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min People
                </label>
                <input
                  type="number"
                  value={filters.minPeople}
                  onChange={(e) =>
                    handleFilterChange("minPeople", e.target.value)
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Minimum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max People
                </label>
                <input
                  type="number"
                  value={filters.maxPeople}
                  onChange={(e) =>
                    handleFilterChange("maxPeople", e.target.value)
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Maximum"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && trips.length === 0 && <div>No trips found.</div>}
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div
              key={trip._id}
              onClick={() => handleTripClick(trip._id)}
              className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md hover:border-purple-300 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                    {trip.placeName}
                  </div>
                  {getStatusBadge(trip)}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors"
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
              <div className="text-sm text-gray-600 mb-2">
                <span className="inline-flex items-center gap-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="inline-flex items-center gap-1">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0A2.5 2.5 0 0021 15c0-1.38-.5-2-1.5-2s-1.5.62-1.5 2c0 .38.1.74.25 1.05M18.75 9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  {trip.numberOfPeople} people
                </span>
              </div>
              {trip.description && (
                <div className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg">
                  {trip.description}
                </div>
              )}
              <div className="mt-4 text-xs text-purple-600 font-medium">
                Click to manage itinerary →
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyTrips;
