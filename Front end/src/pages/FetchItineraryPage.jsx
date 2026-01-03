import React, { useState } from "react";

function FetchItineraryPage() {
  const [tripId, setTripId] = useState("");
  const [result, setResult] = useState(null);

  // UI for fetching itinerary by tripId (input, fetch button, display results)
  // You can connect this to your backend API

  return (
    <div>
      <h2>Fetch Itinerary</h2>
      <p>Coming soon: Fetch and view itinerary sections for a trip.</p>
      {/* Input and results UI goes here */}
    </div>
  );
}

export default FetchItineraryPage;
