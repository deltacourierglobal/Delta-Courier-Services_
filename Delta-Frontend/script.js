document.addEventListener("DOMContentLoaded", function () {

  /* ==============================
     TRACKING FORM
  ============================== */

  const trackingForm = document.getElementById("trackingForm");
  const trackingInput = document.getElementById("trackingNumber");

  if (trackingForm && trackingInput) {
    trackingForm.addEventListener("submit", function (e) {

      e.preventDefault();

      const trackingNumber = trackingInput.value.trim();

      if (!trackingNumber) {
        alert("Please enter a tracking number!");
        return;
      }

      window.location.href = "/track.html?number=" + encodeURIComponent(trackingNumber);

    });
  }


  /* ==============================
     REGISTER SHIPMENT BUTTON
  ============================== */

  const registerBtn = document.getElementById("registerShipmentBtn");

  if (registerBtn) {

    registerBtn.addEventListener("click", function () {

      window.location.href = "/register.html";

    });

  }


  /* ==============================
     FLOATING BACKGROUND ANIMATION
  ============================== */

  const cargo = document.querySelector(".bg-image.cargo");
  const truck = document.querySelector(".bg-image.truck");

  function animateBackground() {

    if (!cargo || !truck) return;

    let cargoLeft = parseInt(cargo.style.left) || -200;
    let truckLeft = parseInt(truck.style.left) || window.innerWidth;

    cargoLeft += 1;
    truckLeft -= 1;

    if (cargoLeft > window.innerWidth) cargoLeft = -200;
    if (truckLeft < -200) truckLeft = window.innerWidth;

    cargo.style.left = cargoLeft + "px";
    truck.style.left = truckLeft + "px";

    requestAnimationFrame(animateBackground);

  }

  requestAnimationFrame(animateBackground);


  /* ==============================
     COUNTER ANIMATION
  ============================== */

  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {

    counter.innerText = "0";

    const target = +counter.getAttribute("data-target");

    const updateCounter = () => {

      const current = +counter.innerText;
      const increment = target / 100;

      if (current < target) {

        counter.innerText = Math.ceil(current + increment);

        setTimeout(updateCounter, 20);

      } else {

        counter.innerText = target;

      }

    };

    updateCounter();

  });


  /* ==============================
     DELIVERY DATE (TRACK PAGE)
  ============================== */

  const deliveryDate = document.getElementById("deliveryDate");

  if (deliveryDate && window.currentShipmentData) {

    const data = window.currentShipmentData;

    const today = new Date();

    let days = 3;

    if (data.deliveryType && data.deliveryType.toLowerCase().includes("express")) {
      days = 1;
    }

    today.setDate(today.getDate() + days);

    deliveryDate.innerText = today.toDateString();

  }


  /* ==============================
     ROUTE PROGRESS BAR (TRACK PAGE)
  ============================== */

  const routeProgress = document.getElementById("routeProgress");
  const routeTruck = document.getElementById("routeTruck");

  if (routeProgress) {

    let progress = 25;

    if (window.currentShipmentStatus) {

      const status = window.currentShipmentStatus.toLowerCase();

      if (status.includes("picked")) progress = 50;
      if (status.includes("transit")) progress = 75;
      if (status.includes("delivered")) progress = 100;

    }

    routeProgress.style.width = progress + "%";

    if (routeTruck) {
      routeTruck.style.left = progress + "%";
    }

  }

});


/* ==============================
   CHAT WIDGET
============================== */

function toggleChat() {

  const chatBox = document.getElementById("chatBox");

  if (!chatBox) return;

  if (chatBox.style.display === "block") {
    chatBox.style.display = "none";
  } else {
    chatBox.style.display = "block";
  }

}

/* ==============================
GLOBAL MAP
============================== */

function initGlobalMap(){

const mapDiv = document.getElementById("map");

if(!mapDiv) return;

const center = {lat:20,lng:0};

const map = new google.maps.Map(mapDiv,{
zoom:2,
center:center
});

const locations=[
{lat:51.5074,lng:-0.1278}, // London
{lat:40.7128,lng:-74.0060}, // New York
{lat:6.5244,lng:3.3792}, // Lagos
{lat:25.2048,lng:55.2708}, // Dubai
{lat:35.6895,lng:139.6917} // Tokyo
];

locations.forEach(loc=>{
new google.maps.Marker({
position:loc,
map:map
});
});

}

window.addEventListener("load",initGlobalMap);

/* ==============================
SMOOTH SCROLL
============================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function(e){

e.preventDefault();

document.querySelector(this.getAttribute("href")).scrollIntoView({
behavior:"smooth"
});

});

});