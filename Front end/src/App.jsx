// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import HomePage from "./pages/HomePage";
import PlanTrip from "./pages/PlanTrip";
import MyTrips from "./pages/MyTrips";
import Community from "./pages/Community";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/CalendarPage";
import AdminPage from "./pages/AdminPage";
import AddItineraryPage from "./pages/AddItineraryPage";
import FetchItineraryPage from "./pages/FetchItineraryPage";
import Itinerary from "./pages/Itinerary";


function App() {
  return (
    <Routes>
      {/* default redirect to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<HomePage />} />

      {/* auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* plan trip route */}
      <Route path="/plan-trip" element={<PlanTrip />} />
      <Route path="/my-trips" element={<MyTrips />} />
      <Route path="/itinerary/:tripId" element={<Itinerary />} />
      <Route path="/community" element={<Community />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* new pages */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/add-itinerary" element={<AddItineraryPage />} />
      <Route path="/fetch-itinerary" element={<FetchItineraryPage />} />
      <Route path="/admin" element={<AdminPage />} />

      {/* optional catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
