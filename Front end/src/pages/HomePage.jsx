import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const SUGGESTED_API_URL = "http://localhost:3000/api/suggested-place";
const TRIP_SEARCH_API_URL = "http://localhost:3000/api/trip/search";
const TRIP_API_URL = "http://localhost:3000/api/trip";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tripResults, setTripResults] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState("");
  const [previousTrips, setPreviousTrips] = useState([]);
  const [previousTripsLoading, setPreviousTripsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [groupBy, setGroupBy] = useState("none");
  const [searchAllTrips, setSearchAllTrips] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestedPlaces();
    fetchPreviousTrips();
  }, []);

  const fetchSuggestedPlaces = () => {
    fetch(SUGGESTED_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setSuggestedPlaces(data.places || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load suggested places");
        setLoading(false);
      });
  };

  const fetchPreviousTrips = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setPreviousTripsLoading(false);
      return;
    }

    fetch(`${TRIP_API_URL}/user/${userId}/completed`)
      .then((res) => res.json())
      .then((data) => {
        setPreviousTrips(data.trips || []);
        setPreviousTripsLoading(false);
      })
      .catch(() => {
        setPreviousTripsLoading(false);
      });
  };

  // Search trips by place name
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setTripResults([]);
      setTripError("");
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    setTripLoading(true);
    setTripError("");
    try {
      const userId = localStorage.getItem("userId");
      const url = `${TRIP_SEARCH_API_URL}?q=${encodeURIComponent(searchQuery)}${
        !searchAllTrips && userId ? `&userId=${userId}` : ""
      }`;
      console.log("Search URL:", url); // Debug log
      const res = await fetch(url);
      console.log("Response status:", res.status); // Debug log
      const data = await res.json();
      console.log("Search response:", data); // Debug log

      let searchResults = data.trips || [];

      // Fallback: also search through loaded previous trips
      const localMatches = previousTrips.filter((trip) =>
        trip.placeName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Combine results and remove duplicates
      const allResults = [...searchResults];
      localMatches.forEach((trip) => {
        if (!allResults.find((existing) => existing._id === trip._id)) {
          allResults.push(trip);
        }
      });

      setTripResults(allResults);

      if (allResults.length === 0 && localMatches.length > 0) {
        console.log(
          "API returned no results, but found local matches:",
          localMatches
        );
      }
    } catch (error) {
      console.error("Search error:", error); // Debug log

      // Fallback to local search if API fails
      const localMatches = previousTrips.filter((trip) =>
        trip.placeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTripResults(localMatches);

      if (localMatches.length === 0) {
        setTripError("Failed to search trips");
      }
    } finally {
      setTripLoading(false);
    }
  };

  // Trigger search on Enter key
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Sort and group functions
  const sortTrips = (trips) => {
    const sorted = [...trips];
    switch (sortBy) {
      case "date":
        return sorted.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
      case "name":
        return sorted.sort((a, b) => a.placeName.localeCompare(b.placeName));
      case "people":
        return sorted.sort((a, b) => b.numberOfPeople - a.numberOfPeople);
      default:
        return sorted;
    }
  };

  const groupTrips = (trips) => {
    if (groupBy === "none") return { "All Results": trips };

    const grouped = {};
    trips.forEach((trip) => {
      let key;
      switch (groupBy) {
        case "location":
          key = trip.placeName;
          break;
        case "people":
          key = `${trip.numberOfPeople} People`;
          break;
        case "month":
          key = new Date(trip.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          });
          break;
        default:
          key = "All Results";
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(trip);
    });
    return grouped;
  };

  const handleTripClick = (tripId) => {
    navigate(`/itinerary/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-25">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-12 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Journey
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Discover amazing destinations, create detailed itineraries, and
            connect with fellow travelers. Your next adventure starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/plan-trip")}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Start Planning
            </button>
            <button
              onClick={() => navigate("/my-trips")}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              View My Trips
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
            <p className="text-gray-600">Destinations Covered</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">10K+</h3>
            <p className="text-gray-600">Happy Travelers</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">98%</h3>
            <p className="text-gray-600">Success Rate</p>
          </div>
        </div>
        {/* Search Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Search Your Perfect Destination
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setHasSearched(false);
                }
              }}
              onKeyDown={handleInputKeyDown}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-gray-50"
            />
            <div className="flex gap-2">
              <button
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                onClick={handleSearch}
              >
                Search
              </button>
              <div className="relative">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 outline-none"
                >
                  <option value="none">Group by</option>
                  <option value="location">Location</option>
                  <option value="people">People Count</option>
                  <option value="month">Month</option>
                </select>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Filter {showFilters ? "↑" : "↓"}
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 outline-none"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="people">Sort by People</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Search Options</h4>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={searchAllTrips}
                  onChange={(e) => setSearchAllTrips(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Search all trips (not just mine)
                </span>
              </label>
            </div>
          </div>
        )}
        {/* Search Results */}
        {hasSearched && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Search Results
              </h3>
              {tripLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Searching...</p>
                </div>
              )}
              {tripError && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  {tripError}
                </div>
              )}
              {!tripLoading && !tripError && tripResults.length === 0 && (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-600">
                    No trips found for "{searchQuery}".
                  </p>
                </div>
              )}
              {!tripLoading && !tripError && tripResults.length > 0 && (
                <div className="space-y-6">
                  {Object.entries(groupTrips(sortTrips(tripResults))).map(
                    ([groupName, trips]) => (
                      <div key={groupName}>
                        {groupBy !== "none" && (
                          <h4 className="text-lg font-semibold text-gray-700 mb-4">
                            {groupName} ({trips.length})
                          </h4>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {trips.map((trip) => (
                            <div
                              key={trip._id}
                              onClick={() => handleTripClick(trip._id)}
                              className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
                            >
                              <div className="h-40 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                                <div className="text-center">
                                  <svg
                                    className="mx-auto h-8 w-8 text-purple-400 mb-2"
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
                                  <span className="text-sm text-purple-600 font-medium">
                                    Trip
                                  </span>
                                </div>
                              </div>
                              <div className="p-4">
                                <p className="text-base font-semibold text-gray-900 mb-2">
                                  {trip.placeName}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  {new Date(
                                    trip.startDate
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(trip.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  People: {trip.numberOfPeople}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {trip.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}
        {/* Top Regional Selections (Suggested Places) */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Top Regional Selections
                </h3>
                <p className="text-gray-600 mt-1">
                  Discover popular destinations curated by our travel experts
                </p>
              </div>
              <button
                onClick={() => navigate("/community")}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading destinations...</p>
              </div>
            )}
            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {suggestedPlaces.map((place) => (
                <div
                  key={place._id}
                  className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
                >
                  <div className="h-32 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center overflow-hidden">
                    {place.images && place.images.length > 0 ? (
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-purple-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs text-purple-600">Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {place.name}
                    </p>
                    <p className="text-xs text-gray-600">{place.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Previous Trips */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Travel History
                </h3>
                <p className="text-gray-600 mt-1">
                  Revisit your completed adventures
                </p>
              </div>
              <button
                onClick={() => navigate("/my-trips")}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>
            {previousTripsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your trips...</p>
              </div>
            )}
            {!previousTripsLoading && previousTrips.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No completed trips yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Your completed adventures will appear here.
                </p>
                <button
                  onClick={() => navigate("/plan-trip")}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Plan Your First Trip
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousTrips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => handleTripClick(trip._id)}
                  className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
                >
                  <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-green-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-green-600 font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {trip.placeName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(trip.startDate).toLocaleDateString()} -{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      People: {trip.numberOfPeople}
                    </p>
                    {trip.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to plan, manage, and enjoy your perfect trip
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Smart Planning
                </h4>
                <p className="text-gray-600">
                  Create detailed itineraries with budget tracking and activity
                  management
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Community Driven
                </h4>
                <p className="text-gray-600">
                  Connect with fellow travelers and share experiences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Advanced Analytics
                </h4>
                <p className="text-gray-600">
                  Track your travel statistics and discover new destinations
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/plan-trip")}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl flex items-center gap-3 font-semibold transition-all transform hover:scale-105"
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
        Plan a Trip
      </button>
    </div>
  );
};

export default HomePage;
