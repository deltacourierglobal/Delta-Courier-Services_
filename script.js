const validTrackingNumbers = {
  "MX908472615US": {
    receiver: "Erica Acosta",
    origin: "San Francisco, U.S.A",
    destination: "Mochis Sinaloa, Mexico",
    airport: "Felipe Ángeles International Airport (NLU/AIFA)).",
    shipmentDate: "February 10, 2026",
    estimatedDelivery: "February 11, 2026",
    weight: "10.5kg",
    service: "Private Express",
    status: "Package has arrived at Felipe Ángeles International Airport (NLU/AIFA). and is awaiting customs clearance.",
    history: [
      "Package received at Felipe Ángeles International Airport (NLU/AIFA).",
      "Package departed San Francisco International Airport",
      "Arrived at Felipe Ángeles International Airport (NLU/AIFA)."
    ]
  }
};

const trackBtn = document.getElementById("trackBtn");

if (trackBtn) {
  trackBtn.addEventListener("click", function () {
    const trackingInput = document.getElementById("trackingInput").value.trim();
    
    if (validTrackingNumbers[trackingInput]) {
      localStorage.setItem("trackingData", JSON.stringify(validTrackingNumbers[trackingInput]));
      window.location.href = "track.html";
    } else {
      alert("Tracking number not found. Please check and try again.");
    }
  });
}

if (document.getElementById("trackResult")) {
  const data = JSON.parse(localStorage.getItem("trackingData"));

  if (data) {
    document.getElementById("trackResult").innerHTML = `
      <h3>Shipment Details</h3>
      <p><strong>Receiver:</strong> ${data.receiver}</p>
      <p><strong>Origin:</strong> ${data.origin}</p>
      <p><strong>Destination:</strong> ${data.destination}</p>
      <p><strong>Airport Landed:</strong> ${data.airport}</p>
      <p><strong>Shipment Date:</strong> ${data.shipmentDate}</p>
      <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
      <p><strong>Weight:</strong> ${data.weight}</p>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Current Status:</strong> ${data.status}</p>
      <h4>Tracking History:</h4>
      <ul>
        ${data.history.map(item => `<li>${item}</li>`).join("")}
      </ul>
    `;
  }
}
const backButton = document.getElementById("backButton");

if (backButton) {
  backButton.addEventListener("click", function () {
    window.location.href = "index.html";
  });
}




