const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({

  trackingNumber: String,
  receiver: String,
  origin: String,
  destination: String,
  weight: String,
  deliveryType: String,

  currentStatus: String,

  deliveryDate: Date,
  isDelayed: {
    type: Boolean,
    default: false
  },
  delayReason: {
    type: String,
    default: ""
  },

  lat: Number,
  lng: Number,

  currentLocation: String, // ✅ add this too (important)

  history: [
    {
      status: String,
      location: String,
      lat: Number,
      lng: Number,
      date: String
    }
  ]

}); // ✅ THIS WAS MISSING

module.exports = mongoose.model("Shipment", shipmentSchema);