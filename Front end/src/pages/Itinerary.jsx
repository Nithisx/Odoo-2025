import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:3000/api/itinerary";

const Itinerary = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [itinerarySummary, setItinerarySummary] = useState(null);

  // Form state for new section
  const [newSection, setNewSection] = useState({
    section: 1,
    startDate: "",
    endDate: "",
    budget: "",
    place: "",
    activities: "",
    info: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchItinerary();
    }
  }, [tripId]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/trip/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
        setItinerarySummary({
          totalBudget: data.totalBudget,
          totalPlaces: data.totalPlaces,
          totalActivities: data.totalActivities,
          daysCovered: data.daysCovered,
        });
      } else {
        setError("Failed to fetch itinerary");
      }
    } catch (err) {
      setError("Error loading itinerary");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSection = async () => {
    if (!newSection.place || !newSection.startDate || !newSection.endDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Convert activities string to array
      const activitiesArray = newSection.activities
        .split(",")
        .map((activity) => activity.trim())
        .filter((activity) => activity.length > 0);

      const sectionToAdd = {
        section: sections.length + 1,
        startDate: newSection.startDate,
        endDate: newSection.endDate,
        budget: parseInt(newSection.budget) || 0,
        place: newSection.place,
        activities: activitiesArray,
        info: newSection.info,
      };

      // Send all sections including the new one
      const updatedSections = [...sections, sectionToAdd];

      const res = await fetch(`${API_BASE_URL}/create/${tripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSections),
      });

      if (res.ok) {
        setSuccess("Section added successfully!");
        setNewSection({
          section: 1,
          startDate: "",
          endDate: "",
          budget: "",
          place: "",
          activities: "",
          info: "",
        });
        setShowAddForm(false);
        fetchItinerary(); // Refresh the data
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to add section");
      }
    } catch (err) {
      setError("Error adding section");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Trip Itinerary
                </h1>
                <p className="text-gray-600">
                  Plan and organize your trip activities
                </p>
              </div>
              <button
                onClick={() => navigate("/my-trips")}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                ← Back to My Trips
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Summary Card */}
          {itinerarySummary && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Itinerary Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{itinerarySummary.totalBudget?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {itinerarySummary.totalPlaces}
                  </div>
                  <div className="text-sm text-gray-500">Places</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {itinerarySummary.totalActivities}
                  </div>
                  <div className="text-sm text-gray-500">Activities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {itinerarySummary.daysCovered}
                  </div>
                  <div className="text-sm text-gray-500">Days Covered</div>
                </div>
              </div>
            </div>
          )}

          {/* Add Section Button */}
          {!showAddForm && (
            <div className="mb-8">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-purple-300 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Add New Section
              </button>
            </div>
          )}

          {/* Add Section Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Add New Section
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Place */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={newSection.place}
                    onChange={handleInputChange}
                    placeholder="e.g., Paris Tower"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newSection.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newSection.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={newSection.budget}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activities
                  </label>
                  <input
                    type="text"
                    name="activities"
                    value={newSection.activities}
                    onChange={handleInputChange}
                    placeholder="boating, lunch, sightseeing"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple activities with commas
                  </p>
                </div>

                {/* Info */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="info"
                    value={newSection.info}
                    onChange={handleInputChange}
                    placeholder="Any special notes or information..."
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={saving}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-md shadow-purple-300 transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Section"}
                </button>
              </div>
            </div>
          )}

          {/* Existing Sections */}
          <div className="space-y-6">
            {sections.length === 0 && !showAddForm ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No itinerary sections yet
                </h3>
                <p className="text-sm text-gray-500">
                  Start planning your trip by adding your first section!
                </p>
              </div>
            ) : (
              sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {section.place}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
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
                          {formatDate(section.startDate)} -{" "}
                          {formatDate(section.endDate)}
                        </div>
                        {section.budget > 0 && (
                          <div className="flex items-center gap-1">
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
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                            ₹{section.budget.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Section {section.section}
                    </span>
                  </div>

                  {section.activities && section.activities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Activities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {section.activities.map((activity, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.info && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Additional Information
                      </h4>
                      <p className="text-gray-700 text-sm">{section.info}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Itinerary;
