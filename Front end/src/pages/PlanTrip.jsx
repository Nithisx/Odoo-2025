import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const API_BASE_URL = "http://localhost:3000/api";

const PlanTrip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    placeName: '',
    startDate: '',
    endDate: '',
    numberOfPeople: 1,
    description: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch suggested places from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setSuggestionsLoading(true);
        const res = await fetch(`${API_BASE_URL}/suggested-place`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.places || []);
        } else {
          console.error('Failed to fetch suggestions');
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectPlace = (placeName) => {
    setFormData((prev) => ({
      ...prev,
      placeName: placeName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get user ID from localStorage or your auth system
      const userId = localStorage.getItem('userId') || '';

      const tripData = {
        startDate: formData.startDate,
        placeName: formData.placeName,
        endDate: formData.endDate,
        numberOfPeople: parseInt(formData.numberOfPeople),
        description: formData.description,
        createdBy: userId,
      };

      const res = await fetch(`${API_BASE_URL}/trip/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });

      if (res.ok) {
        navigate('/');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create trip');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replace old header with Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Create a new Trip</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Trip Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Place Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Place
              </label>
              <input
                type="text"
                name="placeName"
                value={formData.placeName}
                onChange={handleChange}
                placeholder="Search for a destination"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Number of People */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip..."
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </form>

        {/* Suggestions Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Suggestions for Places to Visit / Activities to Perform
          </h3>

          {suggestionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No suggestions available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((place) => (
                <div
                  key={place._id}
                  onClick={() => handleSelectPlace(place.name)}
                  className={`bg-white rounded-xl border overflow-hidden
                             hover:shadow-lg transition-all cursor-pointer
                             ${formData.placeName === place.name 
                               ? 'border-purple-500 ring-2 ring-purple-300' 
                               : 'border-gray-200 hover:border-purple-300'}`}
                >
                  {/* Place Image */}
                  <div className="h-40 bg-gray-200">
                    {place.images && place.images.length > 0 && (
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <p className="text-base font-medium text-gray-800">{place.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{place.location}</p>
                    {place.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700
                       hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white 
                       rounded-lg font-medium shadow-md shadow-purple-300 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlanTrip;