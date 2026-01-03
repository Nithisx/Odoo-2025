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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Explore the World
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-8">
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
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg \
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              onClick={handleSearch}
            >
              Search
            </button>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 outline-none"
              >
                <option value="none">Group by</option>
                <option value="location">Location</option>
                <option value="people">People Count</option>
                <option value="month">Month</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              Filter {showFilters ? "↑" : "↓"}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="people">Sort by People</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Search Options</h4>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Search Results
            </h3>
            {tripLoading && <div>Searching...</div>}
            {tripError && <div className="text-red-500">{tripError}</div>}
            {!tripLoading && !tripError && tripResults.length === 0 && (
              <div>No trips found for "{searchQuery}".</div>
            )}
            {!tripLoading && !tripError && tripResults.length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupTrips(sortTrips(tripResults))).map(
                  ([groupName, trips]) => (
                    <div key={groupName}>
                      {groupBy !== "none" && (
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                          {groupName} ({trips.length})
                        </h4>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {trips.map((trip) => (
                          <div
                            key={trip._id}
                            onClick={() => handleTripClick(trip._id)}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <div className="h-40 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">Trip</span>
                            </div>
                            <div className="p-4">
                              <p className="text-base font-medium text-gray-700">
                                {trip.placeName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(trip.startDate).toLocaleDateString()}{" "}
                                - {new Date(trip.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                People: {trip.numberOfPeople}
                              </p>
                              <p className="text-xs text-gray-500">
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
          </section>
        )}
        {/* Top Regional Selections (Suggested Places) */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Top Regional Selections
          </h3>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {suggestedPlaces.map((place) => (
              <div
                key={place._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-24 bg-gray-200 flex items-center justify-center">
                  {place.images && place.images.length > 0 ? (
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700">
                    {place.name}
                  </p>
                  <p className="text-xs text-gray-500">{place.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Previous Trips */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Previous Trips
          </h3>
          {previousTripsLoading && <div>Loading previous trips...</div>}
          {!previousTripsLoading && previousTrips.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                No completed trips yet
              </h4>
              <p className="text-sm text-gray-500">
                Your completed adventures will appear here.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previousTrips.map((trip) => (
              <div
                key={trip._id}
                onClick={() => handleTripClick(trip._id)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400 mb-2"
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
                    <span className="text-sm text-gray-500">Completed</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-base font-medium text-gray-700">
                    {trip.placeName}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    People: {trip.numberOfPeople}
                  </p>
                  {trip.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <button
        onClick={() => navigate("/plan-trip")}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 \
                   text-white px-6 py-3 rounded-full shadow-lg shadow-purple-300 flex items-center gap-2 font-semibold transition-colors"
      >
        <span className="text-xl">+</span>
        Plan a trip
      </button>
    </div>
  );
};

export default HomePage;
