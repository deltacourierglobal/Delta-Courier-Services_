// ================================
// LOAD ENV VARIABLES
// ================================


console.log("🔥 SERVER STARTING...");

console.log("redeploy trigger");

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require("multer");

const sendEmail = require("./utils/sendEmail");
const sendSMS = require("./utils/sendSMS");

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//====NEW====//
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads/hero");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "hero.jpg"); // always overwrite
  }
});

const upload = multer({ storage });

// Upload route
app.post("/upload-hero", upload.single("hero"), (req, res) => {
  res.json({ message: "Hero image updated!" });
});

// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// DATABASE CONNECTION
// ================================
let DB_CONNECTED = false;

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  DB_CONNECTED = true;
  console.log("MongoDB connected");
})
.catch(err=>{
  console.log("MongoDB failed:", err.message);
  DB_CONNECTED = false;
});

// ================================
// SHIPMENT MODEL
// ================================
const shipmentSchema = new mongoose.Schema({

trackingNumber: String,

sender:String,
senderEmail:String,
senderPhone:String,

shipmentDesc:String,

shippingFee:String,
insuranceFee:String,
taxFee:String,
total:String,

receiver: String,

email: String,
phone: String,

origin: String,
destination: String,
weight: String,
deliveryType: String,
currentStatus: String,

deliveryDate: Date,
isDelayed: Boolean,
delayReason: String,
lastUpdated: Date,

transportMode:String,

lat: Number,
lng: Number,

history:[
{
date:String,
location:String,
status:String
}
]

});

const Shipment = mongoose.model("Shipment", shipmentSchema);
// ================================
// MOCK STORAGE (if DB fails)
// ================================
let mockShipments = [];


// ================================
// TRACKING NUMBER GENERATOR
// ================================
function generateTrackingNumber(){

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

return (
letters[Math.floor(Math.random()*letters.length)] +
letters[Math.floor(Math.random()*letters.length)] +
letters[Math.floor(Math.random()*letters.length)] +
Math.floor(100000000 + Math.random()*900000000)
);

}


// ================================
// API ROUTES
// ================================

app.post("/api/support", (req, res) => {
  const { name, email, trackingNumber, message } = req.body;

  console.log("NEW SUPPORT MESSAGE:", req.body);

  // You can save to DB here later

  res.json({ success: true });
});
/* ================================
   CREATE SHIPMENT
================================ */

app.post('/api/shipments', async (req,res)=>{

const {

receiver,
email,
phone,

sender,
senderEmail,
senderPhone,

shipmentDesc,

shippingFee,
insuranceFee,
taxFee,
total,

origin,
destination,
weight,
deliveryType,

currentStatus,
deliveryDate,
deliveryDays

} = req.body;

if(!receiver || !origin || !destination || !weight || !deliveryType){
return res.status(400).json({
error:"All shipment fields required"
});
}

const trackingNumber = generateTrackingNumber();

const shipment = {

trackingNumber,

receiver,
email,
phone,

sender,
senderEmail,
senderPhone,

shipmentDesc,

shippingFee,
insuranceFee,
taxFee,
total,

origin,
destination,
weight,
deliveryType,

deliveryDate,
deliveryDays,

currentStatus: currentStatus || "Shipment Registered",

history:[
{
status:"Shipment Registered",
location:"Origin Facility",
date:new Date().toLocaleString()
}
]

};

try{

if(DB_CONNECTED){

const newShipment = new Shipment(shipment);

await newShipment.save();

return res.json({
success:true,
trackingNumber
});

}else{

mockShipments.push(shipment);

return res.json({
success:true,
trackingNumber
});

}

}catch(err){

console.log(err);

res.status(500).json({
error:"Server error"
});

}

});
/* ================================
   GET ALL SHIPMENTS
================================ */

app.get('/api/shipments', async (req,res)=>{

try{

let shipments;

if(DB_CONNECTED){

shipments = await Shipment.find();

}else{

shipments = mockShipments;

}

res.json(shipments);

}catch(err){

res.status(500).json({error:"Server error"});

}

});



/* ================================
   GET SHIPMENT BY TRACKING NUMBER
================================ */

app.get('/api/shipments/:trackingNumber', async (req,res)=>{

const {trackingNumber} = req.params;

try{

let shipment;

if(DB_CONNECTED){

shipment = await Shipment.findOne({trackingNumber});

}else{

shipment = mockShipments.find(s=>s.trackingNumber === trackingNumber);

}

if(!shipment)
return res.status(404).json({error:"Shipment not found"});

res.json(shipment);

}catch(err){

res.status(500).json({error:"Server error"});

}

});



/* ================================
   UPDATE SHIPMENT (ADMIN)
================================ */

app.put('/api/shipments/:trackingNumber', async (req,res)=>{

const {password, currentStatus, historyItem} = req.body;

if(password !== process.env.ADMIN_PASSWORD)
return res.status(403).json({error:"Unauthorized"});

try{

let shipment;

/* FIND */

if(DB_CONNECTED){
shipment = await Shipment.findOne({trackingNumber:req.params.trackingNumber});
}else{
shipment = mockShipments.find(s=>s.trackingNumber === req.params.trackingNumber);
}

if(!shipment)
return res.status(404).json({error:"Shipment not found"});

/* SAFETY */
if(!shipment.history) shipment.history = [];

/* STATUS */
if(currentStatus){
shipment.currentStatus = currentStatus;
}

/* HISTORY */
if(historyItem){
shipment.history.push(historyItem);
shipment.lastUpdated = new Date();
}

/* LOCATION */
if (req.body.lat !== undefined && req.body.lng !== undefined) {
  shipment.lat = Number(req.body.lat);
  shipment.lng = Number(req.body.lng);
}

/* DELIVERY DATE */
if(req.body.deliveryDate){
shipment.deliveryDate = new Date(req.body.deliveryDate);
}

/* TRANSPORT MODE */

if(req.body.transportMode){
shipment.transportMode = req.body.transportMode;
}

/* MANUAL DELAY */
if(req.body.isDelayed !== undefined){
shipment.isDelayed = req.body.isDelayed;
}

if(req.body.delayReason){
shipment.delayReason = req.body.delayReason;
}

/* AUTO DELAY */
if(shipment.lastUpdated){
const now = new Date();
const diffHours = (now - new Date(shipment.lastUpdated)) / (1000 * 60 * 60);

if(diffHours > 24 && shipment.currentStatus !== "Delivered"){
shipment.isDelayed = true;
shipment.delayReason = "No movement for 24+ hours";
}
}

console.log("EMAIL:", shipment.email);
console.log("STATUS:", shipment.currentStatus);
/* SAVE */
if(DB_CONNECTED){
await shipment.save();
}

/* SEND EMAIL */

try{

if(shipment.email){

let emailMessage = req.body.customerMessage?.trim();

if(!emailMessage && req.body.currentStatus){

switch(shipment.currentStatus){

case "Shipment Registered":
emailMessage =
"Your shipment has been successfully registered into our logistics system and is awaiting processing.";
break;

case "In Transit":
emailMessage =
"Your shipment is currently in transit and moving through our delivery network.";
break;

case "Arrived at Facility":
emailMessage =
"Your shipment has arrived at one of our processing facilities and will continue to the next destination shortly.";
break;

case "Customs Clearance":
emailMessage =
"Your shipment is currently undergoing customs clearance procedures.";
break;


case "Out for Delivery":
emailMessage =
"Your shipment is out for delivery and should arrive soon.";
break;

case "Delivered":
emailMessage =
"Your shipment has been successfully delivered. Thank you for choosing Delta Courier.";
break;

case "Delayed":
emailMessage =
"There is a temporary delay affecting your shipment. Our logistics team is actively working to resolve it.";
break;

default:
emailMessage =
"Your shipment status has been updated. Please track your package for the latest information.";

}

}

await sendEmail(



shipment.email,

"Shipment Update - Delta Courier",

shipment.receiver,

shipment.trackingNumber,

emailMessage,

shipment.currentStatus

);

}

}catch(err){

console.log("EMAIL ERROR:", err);

}

/* SEND SMS */

try{

if(shipment.phone){

await sendSMS(

shipment.phone,

`Delta Courier:
Shipment ${shipment.trackingNumber}
is now ${shipment.currentStatus}.`

);

}

}catch(err){

console.log("SMS ERROR:", err);

}

res.json({success:true, shipment});

}catch(err){

console.log(err);

res.status(500).json({error:"Server error"});

}

});

// ================================
// SERVE FRONTEND
// ================================

app.use(express.static(path.join(__dirname,"Delta-Frontend")));
app.use('/api/auth', authRoutes);

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"Delta-Frontend","index.html"));
});

console.log("🚀 ABOUT TO LISTEN...");

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

console.log(`🚀 Server running on port ${PORT}`);

if(!DB_CONNECTED){
console.log("⚠️ Running in MOCK MODE (No MongoDB)");
}

});