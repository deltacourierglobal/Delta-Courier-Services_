const fs = require('fs');
const path = require('path');
const Shipment = require('../models/Shipment');

const mockFile = path.join(__dirname, '../mockShipments.json');

let DB_CONNECTED = false;
let mockShipments = [];

// Load mock shipments from JSON file
function loadMockShipments() {
  try {
    const data = fs.readFileSync(mockFile, 'utf8');
    mockShipments = JSON.parse(data);
  } catch {
    mockShipments = [];
  }
}

// Save mock shipments to JSON file
function saveMockShipments() {
  fs.writeFileSync(mockFile, JSON.stringify(mockShipments, null, 2));
}

// Initialize mock shipments
loadMockShipments();

// Set DB connected flag
exports.setDBConnected = (status) => { DB_CONNECTED = status };

// --------------------
// CREATE SHIPMENT
// --------------------
exports.createShipment = async (req, res) => {
const {
  receiver,
  origin,
  destination,
  weight,
  deliveryType,
  currentStatus,
  shipmentDate
} = req.body;
  if (!receiver || !origin || !destination || !weight || !deliveryType) {
    return res.status(400).json({ error: "All shipment fields required" });
  }

  const trackingNumber =
"DC" + Date.now().toString().slice(-6);

  const shipment = {
    trackingNumber,
    receiver,
    origin,
    destination,
    weight,
    deliveryType,
    currentStatus: currentStatus || "Shipment Registered",

shipmentDate: shipmentDate || new Date().toISOString(),

history: [{
  date: shipmentDate || new Date().toISOString(),
  location: origin,
  status: "Shipment Registered"
}]
  };

  if (DB_CONNECTED) {
    try {
      await new Shipment(shipment).save();
    } catch (err) {
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    loadMockShipments();
    mockShipments.push(shipment);
    saveMockShipments();
  }

  res.json({ success: true, trackingNumber });
};

// --------------------
// GET SHIPMENT
// --------------------
exports.getShipmentByTrackingNumber = async (req, res) => {
  const { trackingNumber } = req.params;
  let shipment;

  if (DB_CONNECTED) {
    try {
      shipment = await Shipment.findOne({ trackingNumber });
    } catch {
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    loadMockShipments();
    shipment = mockShipments.find(s => s.trackingNumber === trackingNumber);
  }

  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  res.json(shipment);
};

// --------------------
// UPDATE SHIPMENT (ADMIN)
// --------------------
exports.updateShipment = async (req, res) => {
  const { password, currentStatus, historyItem, lat, lng, deliveryDate, isDelayed, delayReason } = req.body;

  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(403).json({ error: "Unauthorized" });

  const { trackingNumber } = req.params;

  let shipment;

  if (DB_CONNECTED) {
    try {
      shipment = await Shipment.findOne({ trackingNumber });
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });

      // ✅ Admin sets exactly what they want
      if (currentStatus) shipment.currentStatus = currentStatus;
      if (lat !== undefined) shipment.lat = lat;
      if (lng !== undefined) shipment.lng = lng;
      if (deliveryDate) shipment.deliveryDate = new Date(deliveryDate);
      if (isDelayed !== undefined) shipment.isDelayed = isDelayed;
      if (delayReason !== undefined) shipment.delayReason = delayReason;

      if (historyItem) {
        if (!shipment.history) shipment.history = [];
        shipment.history.push(historyItem); // use exactly what admin provides
      }

      await shipment.save();

    } catch (err) {
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    loadMockShipments();
    shipment = mockShipments.find(s => s.trackingNumber === trackingNumber);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    if (currentStatus) shipment.currentStatus = currentStatus;
    if (lat !== undefined) shipment.lat = lat;
    if (lng !== undefined) shipment.lng = lng;
    if (deliveryDate) shipment.deliveryDate = new Date(deliveryDate);
    if (isDelayed !== undefined) shipment.isDelayed = isDelayed;
    if (delayReason !== undefined) shipment.delayReason = delayReason;
    if (historyItem) shipment.history.push(historyItem);

    saveMockShipments();
  }

  res.json({ success: true, shipment });
};

// --------------------
// --------------------
// GET SHIPMENT BY TRACKING NUMBER (PRODUCTION READY)
// --------------------
exports.getShipmentByTrackingNumber = async (req, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber || trackingNumber.trim() === "") {
    return res.status(400).json({ error: "Please enter a tracking number" });
  }

  let shipment;

  if (DB_CONNECTED) {
    try {
      shipment = await Shipment.findOne({ trackingNumber });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error. Please try again later." });
    }
  } else {
    // Mock file fallback (optional)
    loadMockShipments();
    shipment = mockShipments.find(s => s.trackingNumber === trackingNumber);
  }

  if (!shipment) {
    return res.status(404).json({ error: "Tracking number not found. Please input a valid tracking number." });
  }

  res.json(shipment);
};

// --------------------
// DELETE SHIPMENT
// --------------------

exports.deleteShipment = async (req,res)=>{

const {trackingNumber}=req.params;

if(DB_CONNECTED){

try{

await Shipment.deleteOne({trackingNumber});

}catch{

return res.status(500).json({error:"Database error"});

}

}else{

loadMockShipments();

mockShipments = mockShipments.filter(
s=>s.trackingNumber!==trackingNumber
);

saveMockShipments();

}

res.json({success:true});

};