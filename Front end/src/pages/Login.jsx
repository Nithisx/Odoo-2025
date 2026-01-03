import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 200) {
        navigate("/home");
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 lg:px-10">
        {/* left: form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 mb-12">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm font-semibold text-gray-600">Fingger</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Holla,
            <br />
            Welcome Back
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Hey, welcome back to your special place.
          </p>

          <form className="mt-8 space-y-5 max-w-md" onSubmit={handleSubmit}>
            {/* email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full rounded-md border border-gray-200 px-4 py-2.5
                           text-sm outline-none bg-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition"
                required
              />
            </div>

            {/* password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="************"
                className="w-full rounded-md border border-gray-200 px-4 py-2.5
                           text-sm outline-none bg-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition"
                required
              />
            </div>

            {/* error message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* remember + forgot */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-500
                             focus:ring-purple-500"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="hover:text-purple-500">
                Forgot Password?
              </button>
            </div>

            {/* submit */}
            <button
              type="submit"
              className="w-32 mt-2 bg-purple-600 hover:bg-purple-700
                         text-white text-sm font-semibold py-2.5 rounded-md
                         shadow-md shadow-purple-300 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>

        {/* right: text content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Secure & effortless access
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Manage your account, track your activity, and stay connected from
              anywhere with a single sign-in experience.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Strong authentication to protect your data.</li>
              <li>• Access your dashboard anytime, on any device.</li>
              <li>• Stay in sync with real-time updates.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;