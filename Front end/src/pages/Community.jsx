import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const COMMUNITY_API_URL = "http://localhost:3000/api/community";
const TRIP_API_URL = "http://localhost:3000/api/trip";

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userTrips, setUserTrips] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    fetchCommunityMessages();
    fetchUserTrips();
  }, []);

  const fetchCommunityMessages = async () => {
    try {
      const res = await fetch(`${COMMUNITY_API_URL}/fetch`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setError("Failed to load community messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(`${TRIP_API_URL}/user/${userId}`);
      const data = await res.json();
      setUserTrips(data.trips || []);
    } catch {
      console.error("Failed to fetch user trips");
    }
  };

  const handleAddMessage = async () => {
    if (!selectedTripId) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to share your experience");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(`${COMMUNITY_API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId: selectedTripId }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSelectedTripId("");
        fetchCommunityMessages();
      } else {
        alert("Failed to share your experience");
      }
    } catch {
      alert("Failed to share your experience");
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Travel Community
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover inspiring journeys and share your adventures with fellow travelers
            </p>
          </div>

          {/* Add Experience Button */}
          <div className="mb-10 text-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Share Your Experience
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading experiences...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
              <div className="text-red-600 font-medium">{error}</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && messages.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No experiences shared yet
              </h3>
              <p className="text-gray-500">
                Be the first to inspire others with your travel story
              </p>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && !error && messages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.map((message) => (
                <div key={message._id}>
                  {/* Compact Card */}
                  <div
                    onClick={() => setExpandedCard(expandedCard === message._id ? null : message._id)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 overflow-hidden"
                  >
                    {/* Card Header with Gradient */}
                    <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white truncate">
                          {message.trip?.placeName}
                        </h3>
                        <p className="text-white text-opacity-90 text-sm">
                          {getDaysDifference(message.trip?.startDate, message.trip?.endDate)} days trip
                        </p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {message.userId?.firstName?.charAt(0)}
                            {message.userId?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {message.userId?.firstName} {message.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{message.userId?.username}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                            </svg>
                            <span className="text-xs font-medium">Travelers</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {message.trip?.numberOfPeople}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-xs font-medium">Budget</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ${(message.totalBudget / 1000).toFixed(1)}k
                          </p>
                        </div>
                      </div>

                      {/* Activities Preview */}
                      {message.sections && message.sections.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {message.sections[0]?.activities?.slice(0, 2).map((activity, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                              >
                                {activity}
                              </span>
                            ))}
                            {message.sections.length > 1 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{message.sections.length - 1} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                        <span className="text-xs font-medium text-indigo-600">
                          {expandedCard === message._id ? "Show less" : "View details"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Modal */}
                  {expandedCard === message._id && (
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                      onClick={() => setExpandedCard(null)}
                    >
                      <div 
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold mb-2">
                                {message.trip?.placeName}
                              </h2>
                              <div className="flex items-center gap-3 text-white text-opacity-90">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDate(message.trip?.startDate)} - {formatDate(message.trip?.endDate)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setExpandedCard(null)}
                              className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                          {/* User Info */}
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
                              <span className="text-lg font-bold text-white">
                                {message.userId?.firstName?.charAt(0)}
                                {message.userId?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {message.userId?.firstName} {message.userId?.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                @{message.userId?.username}
                              </p>
                            </div>
                          </div>

                          {/* Trip Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-indigo-50 rounded-xl p-4 text-center">
                              <svg className="w-6 h-6 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                              </svg>
                              <p className="text-2xl font-bold text-gray-900">
                                {message.trip?.numberOfPeople}
                              </p>
                              <p className="text-xs text-gray-600">Travelers</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                              <svg className="w-6 h-6 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <p className="text-2xl font-bold text-gray-900">
                                ${message.totalBudget?.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">Total Budget</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 text-center">
                              <svg className="w-6 h-6 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-2xl font-bold text-gray-900">
                                {getDaysDifference(message.trip?.startDate, message.trip?.endDate)}
                              </p>
                              <p className="text-xs text-gray-600">Days</p>
                            </div>
                          </div>

                          {/* Description */}
                          {message.trip?.description && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-2">About this trip</h4>
                              <p className="text-gray-700 leading-relaxed">
                                {message.trip.description}
                              </p>
                            </div>
                          )}

                          {/* Itinerary */}
                          {message.sections && message.sections.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Itinerary Details
                              </h4>
                              <div className="space-y-4">
                                {message.sections.map((section, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-200"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                                          {index + 1}
                                        </span>
                                        <h5 className="font-semibold text-gray-900 text-lg">
                                          {section.place}
                                        </h5>
                                      </div>
                                      {section.budget && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                          ${section.budget}
                                        </span>
                                      )}
                                    </div>
                                    {section.activities && section.activities.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {section.activities.map((activity, i) => (
                                          <span
                                            key={i}
                                            className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 text-sm rounded-full shadow-sm"
                                          >
                                            {activity}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {section.info && (
                                      <p className="text-gray-700 text-sm leading-relaxed">
                                        {section.info}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Experience Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Share Your Experience
            </h3>

            {userTrips.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 mb-6">
                  You don't have any trips to share yet.
                </p>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select a trip to share
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Choose a trip...</option>
                    {userTrips.map((trip) => (
                      <option key={trip._id} value={trip._id}>
                        {trip.placeName} ({formatDate(trip.startDate)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                    disabled={posting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMessage}
                    disabled={!selectedTripId || posting}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
                  >
                    {posting ? "Sharing..." : "Share"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Community;