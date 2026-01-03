import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const ADMIN_API_URL = "http://localhost:3000/api/admin";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tripsFilter, setTripsFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [suggestedPlaceForm, setSuggestedPlaceForm] = useState({
    name: "",
    description: "",
    location: "",
    images: [null],
  });
  const [createPlaceLoading, setCreatePlaceLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user details to check role
      const response = await fetch(
        `http://localhost:3000/api/user/profile/${userId}`
      );
      const data = await response.json();

      console.log("User profile response:", data); // Debug log

      if (data.user && data.user.role === "admin") {
        setIsAdmin(true);
        setUserRole("admin");
        console.log("User is admin, access granted"); // Debug log
      } else {
        setIsAdmin(false);
        setUserRole(data.user?.role || "user");
        console.log("User role:", data.user?.role, "- Access denied"); // Debug log
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to check admin access:", error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchTrips(),
        fetchPopularCities(),
        fetchPopularActivities(),
        fetchAnalytics(),
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/users`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      const url = `${ADMIN_API_URL}/trips${
        tripsFilter ? `?status=${tripsFilter}` : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTrips(data.trips);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  const fetchPopularCities = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/analytics/cities`);
      const data = await response.json();
      if (data.success) {
        setPopularCities(data.cities);
      }
    } catch (error) {
      console.error("Failed to fetch popular cities:", error);
    }
  };

  const fetchPopularActivities = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/analytics/activities`);
      const data = await response.json();
      if (data.success) {
        setPopularActivities(data.activities);
      }
    } catch (error) {
      console.error("Failed to fetch popular activities:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/analytics/overview`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleCreateSuggestedPlace = async (e) => {
    e.preventDefault();
    setCreatePlaceLoading(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to create suggested places");
      setCreatePlaceLoading(false);
      return;
    }

    try {
      // Convert image files to base64
      const imagePromises = suggestedPlaceForm.images
        .filter((img) => img !== null)
        .map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

      const base64Images = await Promise.all(imagePromises);

      const response = await fetch(`${ADMIN_API_URL}/suggested-place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: suggestedPlaceForm.name,
          description: suggestedPlaceForm.description,
          location: suggestedPlaceForm.location,
          images: base64Images,
          addedBy: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Suggested place created successfully!");
        setSuggestedPlaceForm({
          name: "",
          description: "",
          location: "",
          images: [null],
        });
      } else {
        alert(data.message || "Failed to create suggested place");
      }
    } catch (error) {
      console.error("Failed to create suggested place:", error);
      alert("Failed to create suggested place");
    } finally {
      setCreatePlaceLoading(false);
    }
  };

  const handleImageChange = (index, file) => {
    const newImages = [...suggestedPlaceForm.images];
    newImages[index] = file;
    setSuggestedPlaceForm({ ...suggestedPlaceForm, images: newImages });
  };

  const addImageField = () => {
    setSuggestedPlaceForm({
      ...suggestedPlaceForm,
      images: [...suggestedPlaceForm.images, null],
    });
  };

  const removeImageField = (index) => {
    const newImages = suggestedPlaceForm.images.filter((_, i) => i !== index);
    setSuggestedPlaceForm({ ...suggestedPlaceForm, images: newImages });
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will also delete all their trips and data."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${ADMIN_API_URL}/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh users list
        alert("User deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>{icon}</div>
      </div>
    </div>
  );

  const BarChart = ({ data, title, xKey, yKey, color = "#8b5cf6" }) => {
    const maxValue = Math.max(...data.map((item) => item[yKey]));

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 truncate">
                {item[xKey]}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item[yKey] / maxValue) * 100}%`,
                    backgroundColor: color,
                  }}
                ></div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900">
                {item[yKey]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.count / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{item._id}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item.count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">
              Loading admin dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Current role: {userRole || "user"}
            </p>
            <p className="text-sm text-gray-500">Required role: admin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics and user management
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "users", label: "Manage Users", icon: "👥" },
              { id: "cities", label: "Popular Cities", icon: "🏙️" },
              { id: "activities", label: "Popular Activities", icon: "🎯" },
              { id: "places", label: "Manage Places", icon: "📍" },
              { id: "analytics", label: "Analytics", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={analytics.overview.totalUsers}
                subtitle="Registered users"
                icon={
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title="Total Trips"
                value={analytics.overview.totalTrips}
                subtitle={`${analytics.overview.completedTrips} completed`}
                icon={
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                color="green"
              />
              <StatCard
                title="Active Users"
                value={analytics.overview.activeUsers}
                subtitle="This month"
                icon={
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
                color="purple"
              />
              <StatCard
                title="Completion Rate"
                value={`${analytics.overview.completionRate}%`}
                subtitle="Trip completion"
                icon={
                  <svg
                    className="w-6 h-6 text-orange-600"
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
                }
                color="orange"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                data={analytics.groupSizes}
                title="Group Size Distribution"
              />
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Budget Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Budget</span>
                    <span className="font-semibold text-gray-900">
                      ₹{analytics.budget.totalBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Average Budget
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{analytics.budget.avgBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Average Duration
                    </span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(analytics.duration.avgDuration)} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  User Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {users.length} total users
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trips
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.tripCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.completedTrips}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cities" && (
          <div className="space-y-6">
            <BarChart
              data={popularCities}
              title="Most Popular Destinations"
              xKey="city"
              yKey="visitCount"
              color="#8b5cf6"
            />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  City Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total People
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Group Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularCities.map((city, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {city.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {city.visitCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {city.totalPeople}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {city.avgPeople}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(city.lastVisit).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-6">
            <BarChart
              data={popularActivities}
              title="Most Popular Activities"
              xKey="activity"
              yKey="count"
              color="#6366f1"
            />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Activity Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Locations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularActivities.map((activity, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.activity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {activity.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{activity.totalBudget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{activity.avgBudget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.uniqueLocations}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "places" && (
          <div className="space-y-6">
            {/* Create Suggested Place Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Create New Suggested Place
              </h3>
              <form onSubmit={handleCreateSuggestedPlace} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Place Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestedPlaceForm.name}
                      onChange={(e) =>
                        setSuggestedPlaceForm({
                          ...suggestedPlaceForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter place name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestedPlaceForm.location}
                      onChange={(e) =>
                        setSuggestedPlaceForm({
                          ...suggestedPlaceForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={suggestedPlaceForm.description}
                    onChange={(e) =>
                      setSuggestedPlaceForm({
                        ...suggestedPlaceForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the place..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images
                  </label>
                  {suggestedPlaceForm.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(index, e.target.files[0])
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {image && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(image)}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {image.name}
                            </p>
                          </div>
                        )}
                      </div>
                      {suggestedPlaceForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors h-fit"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add Another Image
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={createPlaceLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {createPlaceLoading
                      ? "Creating..."
                      : "Create Suggested Place"}
                  </button>
                </div>
              </form>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Admin Instructions
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Use this form to add new suggested places that will appear
                      on the homepage for all users. Upload high-quality images
                      (JPG, PNG, GIF) and provide detailed descriptions to help
                      users discover amazing destinations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Registration Trends */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  User Registration Trends
                </h3>
                <div className="space-y-3">
                  {analytics.trends.userRegistrations.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {new Date(
                          trend._id.year,
                          trend._id.month - 1
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {trend.count} users
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip Creation Trends */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Trip Creation Trends
                </h3>
                <div className="space-y-3">
                  {analytics.trends.tripCreations.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {new Date(
                          trend._id.year,
                          trend._id.month - 1
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {trend.count} trips
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {trend.totalPeople} people
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Platform Health
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Itinerary Sections
                    </span>
                    <span className="font-medium">
                      {analytics.overview.totalItinerarySections}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Community Messages
                    </span>
                    <span className="font-medium">
                      {analytics.overview.totalCommunityMessages}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Trip Duration
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="font-medium">
                      {Math.round(analytics.duration.avgDuration)} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum</span>
                    <span className="font-medium">
                      {Math.round(analytics.duration.maxDuration)} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Budget Range
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum</span>
                    <span className="font-medium">
                      ₹{analytics.budget.maxBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum</span>
                    <span className="font-medium">
                      ₹{analytics.budget.minBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
