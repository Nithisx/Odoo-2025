import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:3000/api/user";

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    profilePic: null,
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data);
        // Initialize edit form with user data
        if (data.user) {
          setEditForm({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            username: data.user.username || "",
            email: data.user.email || "",
            phoneNumber: data.user.phoneNumber || "",
            city: data.user.city || "",
            country: data.user.country || "",
            profilePic: null,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch user profile");
        setLoading(false);
      });
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && userProfile?.user) {
      // Reset form when starting to edit
      setEditForm({
        firstName: userProfile.user.firstName || "",
        lastName: userProfile.user.lastName || "",
        username: userProfile.user.username || "",
        email: userProfile.user.email || "",
        phoneNumber: userProfile.user.phoneNumber || "",
        city: userProfile.user.city || "",
        country: userProfile.user.country || "",
        profilePic: null,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be less than 5MB");
        return;
      }

      setEditForm((prev) => ({
        ...prev,
        profilePic: file,
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in");
      setUpdateLoading(false);
      return;
    }

    try {
      let formDataToSend = { ...editForm };

      // Convert image to base64 if a new image was selected
      if (editForm.profilePic && editForm.profilePic instanceof File) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(editForm.profilePic);
        });

        try {
          const base64Image = await base64Promise;
          formDataToSend.profilePic = base64Image;
        } catch (error) {
          console.error("Error converting image to base64:", error);
          alert("Error processing image. Please try again.");
          setUpdateLoading(false);
          return;
        }
      } else {
        // If no new image selected, keep the existing profilePic
        formDataToSend.profilePic = userProfile?.user?.profilePic || "";
      }

      const response = await fetch(`${API_BASE_URL}/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        // Update the userProfile state with new data
        setUserProfile((prev) => ({
          ...prev,
          user: { ...prev.user, ...formDataToSend },
        }));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 font-medium">{error}</div>
          </div>
        </div>
      </>
    );
  }

  const { user, upcomingTrips = [], pastTrips = [] } = userProfile || {};

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                {!isEditing ? (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-gray-600 mb-4">@{user?.username}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700">{user?.email}</span>
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {user?.phoneNumber}
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {user?.city}, {user?.country}
                        </span>
                      </div>
                    </div>

                    {user?.role === "admin" && (
                      <div className="mt-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={editForm.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={editForm.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editForm.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Picture
                        </label>
                        <input
                          type="file"
                          name="profilePic"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload high-quality images (JPG, PNG, GIF) - Max 5MB
                        </p>
                        {editForm.profilePic && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(editForm.profilePic)}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          </div>
                        )}
                        {!editForm.profilePic && user?.profilePic && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600">
                              Current image:
                            </p>
                            <img
                              src={user.profilePic}
                              alt="Current"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={editForm.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={editForm.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {updateLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats and Edit Button */}
              <div className="flex flex-col items-end gap-4">
                {!isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}

                <div className="flex gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {upcomingTrips.length}
                    </div>
                    <div className="text-sm text-gray-500">Upcoming Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {pastTrips.length}
                    </div>
                    <div className="text-sm text-gray-500">Past Trips</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trips Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tab Headers */}
            <div className="border-b border-gray-200 px-8 pt-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "upcoming"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Upcoming Trips ({upcomingTrips.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "past"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Past Trips ({pastTrips.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "upcoming" && (
                <div className="space-y-4">
                  {upcomingTrips.length === 0 ? (
                    <div className="text-center py-12">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No upcoming trips
                      </h3>
                      <p className="text-sm text-gray-500">
                        Get started by planning your next adventure!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingTrips.map((trip) => (
                        <div
                          key={trip._id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {trip.placeName}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
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
                            </p>
                            <p className="flex items-center gap-2">
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
                            </p>
                            {trip.description && (
                              <p className="text-gray-700 mt-3">
                                {trip.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "past" && (
                <div className="space-y-4">
                  {pastTrips.length === 0 ? (
                    <div className="text-center py-12">
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
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No past trips
                      </h3>
                      <p className="text-sm text-gray-500">
                        Your completed adventures will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pastTrips.map((trip) => (
                        <div
                          key={trip._id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-slate-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {trip.placeName}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Completed
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
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
                            </p>
                            <p className="flex items-center gap-2">
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
                            </p>
                            {trip.description && (
                              <p className="text-gray-700 mt-3">
                                {trip.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
