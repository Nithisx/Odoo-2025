import React, { useState } from "react";

function AddItineraryPage() {
  const [sections, setSections] = useState([
    {
      section: 1,
      startDate: "",
      endDate: "",
      budget: 0,
      place: "",
      activities: [],
      info: "",
    },
  ]);

  // UI for adding itinerary sections (form fields, add/remove section buttons, etc.)
  // You can connect this to your backend API

  return (
    <div>
      <h2>Add Itinerary</h2>
      <p>Coming soon: Add itinerary sections for your trip.</p>
      {/* Form UI goes here */}
    </div>
  );
}

export default AddItineraryPage;
