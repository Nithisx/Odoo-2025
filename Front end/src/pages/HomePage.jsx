import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Placeholder data for regional selections
  const regionalSelections = [
    { id: 1, name: 'Paris', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Tokyo', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'New York', image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Dubai', image: 'https://via.placeholder.com/150' },
    { id: 5, name: 'London', image: 'https://via.placeholder.com/150' },
  ];

  // Placeholder data for previous trips
  const previousTrips = [
    { id: 1, name: 'Beach Vacation', image: 'https://via.placeholder.com/200' },
    { id: 2, name: 'Mountain Hike', image: 'https://via.placeholder.com/200' },
    { id: 3, name: 'City Tour', image: 'https://via.placeholder.com/200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replace old header with Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Banner Image */}
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Explore the World</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                               hover:bg-gray-50 text-sm font-medium text-gray-700">
              Group by
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                               hover:bg-gray-50 text-sm font-medium text-gray-700">
              Filter
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                               hover:bg-gray-50 text-sm font-medium text-gray-700">
              Sort by
            </button>
          </div>
        </div>

        {/* Top Regional Selections */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Regional Selections</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {regionalSelections.map((region) => (
              <div
                key={region.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden 
                           hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-24 bg-gray-200"></div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700">{region.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Previous Trips */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Trips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previousTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden 
                           hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <p className="text-base font-medium text-gray-700">{trip.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Plan a Trip Button */}
      <button
        onClick={() => navigate('/plan-trip')}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 
                   text-white px-6 py-3 rounded-full shadow-lg shadow-purple-300
                   flex items-center gap-2 font-semibold transition-colors"
      >
        <span className="text-xl">+</span>
        Plan a trip
      </button>
    </div>
  );
};

export default HomePage;