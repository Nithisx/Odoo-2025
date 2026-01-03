// src/SignupPage.jsx
import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/auth";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePic: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add these to the component state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePic: reader.result })); // base64 string [web:122]
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};




  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const res = await axios.post(`${API_BASE_URL}/signup`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    setSuccess(res.data?.message || "Account created successfully.");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Signup failed. Please try again.";
    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to sign up.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="yourusername"
            />
          </div>

          {/* email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          {/* password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* profilePic upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Profile picture (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
               focus:ring-2 focus:ring-purple-500 focus:border-transparent
               file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0
               file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700
               hover:file:bg-purple-100"
            />
            {imagePreview && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {imageFile?.name}
                </span>
              </div>
            )}
          </div>

          {/* first name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="First"
            />
          </div>

          {/* last name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Last"
            />
          </div>

          {/* phone number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Phone number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="1234567890"
            />
          </div>

          {/* city */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your city"
            />
          </div>

          {/* country */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your country"
            />
          </div>

          {/* status + submit */}
          <div className="md:col-span-2 flex flex-col gap-3 mt-2">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-md">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center w-full md:w-40
                         bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400
                         text-white text-sm font-semibold py-2.5 rounded-md
                         transition-colors"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
