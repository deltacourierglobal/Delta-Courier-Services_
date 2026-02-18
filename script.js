document.addEventListener("DOMContentLoaded", function () {

  // =========================
  // INDEX PAGE LOGIC
  // =========================
  const trackBtn = document.getElementById("trackBtn");

  if (trackBtn) {
    trackBtn.addEventListener("click", function () {
      const trackingInput = document.getElementById("trackingInput").value;

      if (trackingInput.trim() === "") {
        alert("Please enter a tracking number");
        return;
      }

      // Save tracking number
      localStorage.setItem("trackingNumber", trackingInput);

      // Redirect to track page
      window.location.href = "track.html";
    });
  }


  // =========================
  // TRACK PAGE LOGIC
  // =========================
  const displayTracking = document.getElementById("displayTracking");

  if (displayTracking) {
    const trackingNumber = localStorage.getItem("trackingNumber");

    if (trackingNumber) {
      displayTracking.innerText = "Tracking Number: " + trackingNumber +
        "\nStatus: Package is in transit 🚚";
    } else {
      displayTracking.innerText = "No tracking number found. Please go back.";
    }
  }


  // =========================
  // BACK BUTTON
  // =========================
  const backButton = document.getElementById("backButton");

  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

});
