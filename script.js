// ======================================
// UTILITY: GENERATE TRACKING NUMBER
// ======================================

function generateTrackingNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = Math.floor(100000000 + Math.random() * 900000000);
  return (
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    numbers +
    "US"
  );
}

// ======================================
// REGISTER SHIPMENT
// ======================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const trackingNumber = generateTrackingNumber();

    const today = new Date();
    const estimated = new Date();
    estimated.setDate(today.getDate() + 3); // 3-day estimate

    const shipment = {
      trackingNumber,
      receiver: document.getElementById("receiver").value,
      origin: document.getElementById("origin").value,
      destination: document.getElementById("destination").value,
      weight: document.getElementById("weight").value,
      service: document.getElementById("service").value,

      shipmentDate: today.toLocaleString(),
      estimatedDelivery: estimated.toLocaleString(),

      stage: 0,
      stages: [
        "Shipment Created",
        "In Transit",
        "Arrived at Distribution Hub",
        "Out for Delivery",
        "Delivered"
      ],
      history: [`Shipment created on ${today.toLocaleString()}`]
    };

    let shipments = JSON.parse(localStorage.getItem("shipments")) || [];
    shipments.push(shipment);
    localStorage.setItem("shipments", JSON.stringify(shipments));

    // Save tracking number for immediate display
    localStorage.setItem("searchTracking", trackingNumber);

    // Redirect to tracking page
    window.location.href = "track.html";
  });
}

// ======================================
// TRACK FROM INDEX PAGE
// ======================================

const trackBtn = document.getElementById("trackBtn");

if (trackBtn) {
  trackBtn.addEventListener("click", function () {
    const trackingInput = document.getElementById("trackingInput").value.trim();

    if (!trackingInput) {
      alert("Please enter a tracking number.");
      return;
    }

    localStorage.setItem("searchTracking", trackingInput);
    window.location.href = "track.html";
  });
}

// ======================================
// DISPLAY TRACKING DETAILS
// ======================================

const trackResult = document.getElementById("trackResult");

if (trackResult) {
  const trackingNumber = localStorage.getItem("searchTracking");
  let shipments = JSON.parse(localStorage.getItem("shipments")) || [];
  const shipment = shipments.find(item => item.trackingNumber === trackingNumber);

  if (shipment) {

   // Calculate stage based on time difference
const shipmentDate = new Date(shipment.shipmentDate);
const now = new Date();

const hoursPassed = Math.floor((now - shipmentDate) / (1000 * 60 * 60));

if (hoursPassed >= 72) {
  shipment.stage = 4; // Delivered
} else if (hoursPassed >= 48) {
  shipment.stage = 3; // Out for Delivery
} else if (hoursPassed >= 24) {
  shipment.stage = 2; // Arrived at Hub
} else if (hoursPassed >= 4) {
  shipment.stage = 1; // In Transit
} else {
  shipment.stage = 0; // Created
}

    const progressBar = shipment.stages
  .map((stageName, index) => `
    <div class="progress-step ${index <= shipment.stage ? 'active' : ''}">
      <div class="circle">${index + 1}</div>
      <div class="label">${stageName}</div>
    </div>
  `).join('');

    trackResult.innerHTML = `
      <div class="modern-card">
        <h3>Tracking #: ${shipment.trackingNumber}</h3>
        <div class="progress-bar">${progressBar}</div>

        <div class="info-grid">
          <div><strong>Receiver:</strong> ${shipment.receiver}</div>
          <div><strong>Origin:</strong> ${shipment.origin}</div>
          <div><strong>Destination:</strong> ${shipment.destination}</div>
          <div><strong>Weight:</strong> ${shipment.weight}</div>
          <div><strong>Service:</strong> ${shipment.service}</div>
          <div><strong>Shipment Date:</strong> ${shipment.shipmentDate}</div>
          <div><strong>Estimated Delivery:</strong> ${shipment.estimatedDelivery}</div>
        </div>

        <div class="map-section">
  <h4>Current Location</h4>
  <iframe
    width="100%"
    height="250"
    style="border:0; border-radius:12px;"
    loading="lazy"
    allowfullscreen
    src="https://www.google.com/maps?q=${encodeURIComponent(shipment.destination)}&output=embed">
  </iframe>
</div>
    `;

  } else {
    trackResult.innerHTML = `
      <div class="modern-card">
        <h3 style="color:red;">Tracking number not found</h3>
      </div>
    `;
  }
}

// ======================================
// CONTACT FORM
// ======================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Your message has been sent successfully! Our team will contact you shortly.");
    contactForm.reset();
  });
}

function updateShipment() {
  const trackingNumber = document.getElementById("adminTracking").value.trim();
  const newStage = parseInt(document.getElementById("adminStage").value);

  let shipments = JSON.parse(localStorage.getItem("shipments")) || [];
  const shipment = shipments.find(item => item.trackingNumber === trackingNumber);

  if (!shipment) {
    document.getElementById("adminMessage").innerText = "Tracking number not found.";
    return;
  }

  shipment.stage = newStage;
  shipment.history[newStage] = `${shipment.stages[newStage]} on ${new Date().toLocaleString()}`;

  localStorage.setItem("shipments", JSON.stringify(shipments));

  document.getElementById("adminMessage").innerText = "Shipment updated successfully!";
}
