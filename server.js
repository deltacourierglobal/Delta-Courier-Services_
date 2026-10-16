console.log("🔥 SERVER STARTING...");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const os = require("os");
const fs = require("fs");

const sendEmail = require("./utils/sendEmail");
const supportRoutes = require("./routes/supportRoutes");
const Stats = require("./models/stats");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(cors());
app.use(express.json());
app.use("/api/support", supportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================================
// HERO IMAGE UPLOAD
// ================================

const uploadDir = path.join(os.tmpdir(), "uploads", "hero");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "hero.jpg")
});

const upload = multer({ storage });

app.post("/upload-hero", upload.single("hero"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No hero image uploaded" });
  }

  res.json({ message: "Hero image uploaded successfully" });
});

// ================================
// DATABASE CONNECTION
// ================================

let DB_CONNECTED = false;

function isDbConnected() {
  return DB_CONNECTED && mongoose.connection.readyState === 1;
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing from environment variables");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      DB_CONNECTED = true;
      console.log("✅ MongoDB connected");
    })
    .catch((err) => {
      DB_CONNECTED = false;
      console.error("❌ MongoDB connection failed:", err.message);
    });

  mongoose.connection.on("disconnected", () => {
    DB_CONNECTED = false;
    console.error("⚠️ MongoDB disconnected");
  });

  mongoose.connection.on("connected", () => {
    DB_CONNECTED = true;
    console.log("✅ MongoDB connection restored");
  });
}

// ================================
// SHIPMENT MODEL
// ================================

const shipmentSchema = new mongoose.Schema({
  trackingNumber: String,

  sender: String,
  senderEmail: String,
  senderPhone: String,

  shipmentDesc: String,

  shippingFee: String,
  insuranceFee: String,
  taxFee: String,
  total: String,

  receiver: String,
  email: String,
  phone: String,

  origin: String,
  destination: String,
  weight: String,
  deliveryType: String,

  currentStatus: String,
  shipmentDate: String,
  deliveryDate: Date,

  isDelayed: Boolean,
  delayReason: String,
  lastUpdated: Date,

  transportMode: String,

  lat: Number,
  lng: Number,

  history: [
    {
      date: String,
      location: String,
      status: String
    }
  ]
});

const Shipment =
  mongoose.models.Shipment ||
  mongoose.model("Shipment", shipmentSchema);

// Temporary fallback storage when MongoDB is unavailable.
// This data is lost when the server restarts.
const mockShipments = [];

// ================================
// TRACKING NUMBER GENERATOR
// ================================

function generateTrackingNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    Math.floor(100000000 + Math.random() * 900000000)
  );
}

// ================================
// CREATE SHIPMENT
// ================================

app.post("/api/shipments", async (req, res) => {
  const {
    receiver,
    email,
    phone,
    transportMode,
    lat,
    lng,
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
    shipmentDate,
    deliveryDate,
    deliveryDays
  } = req.body;

  if (!receiver || !origin || !destination || !weight || !deliveryType) {
    return res.status(400).json({
      error: "All shipment fields required"
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
    transportMode,
    lat,
    lng,
    deliveryDate,
    deliveryDays,
    currentStatus: currentStatus || "Shipment Registered",
    shipmentDate: shipmentDate
      ? new Date(shipmentDate).toLocaleString()
      : new Date().toLocaleString(),
    history: [
      {
        status: "Shipment Registered",
        location: "Origin Facility",
        date: shipmentDate
          ? new Date(shipmentDate).toLocaleString()
          : new Date().toLocaleString()
      }
    ]
  };

  try {
    if (isDbConnected()) {
      await Shipment.create(shipment);
    } else {
      mockShipments.push(shipment);
    }

    return res.json({
      success: true,
      trackingNumber
    });
  } catch (err) {
    console.error("CREATE SHIPMENT ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to create shipment"
    });
  }
});

// ================================
// GET ALL SHIPMENTS
// ================================

app.get("/api/shipments", async (req, res) => {
  try {
    const shipments = isDbConnected()
      ? await Shipment.find()
      : mockShipments;

    return res.json(shipments);
  } catch (err) {
    console.error("LOAD SHIPMENTS ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to load shipments"
    });
  }
});

// ================================
// GET SHIPMENT BY TRACKING NUMBER
// ================================

app.get("/api/shipments/:trackingNumber", async (req, res) => {
  try {
    const shipment = isDbConnected()
      ? await Shipment.findOne({
          trackingNumber: req.params.trackingNumber
        })
      : mockShipments.find(
          (item) =>
            item.trackingNumber === req.params.trackingNumber
        );

    if (!shipment) {
      return res.status(404).json({
        error: "Shipment not found"
      });
    }

    return res.json(shipment);
  } catch (err) {
    console.error("FIND SHIPMENT ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to load shipment"
    });
  }
});

// ================================
// GET STATISTICS
// ================================

app.get("/api/stats", async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: "Database unavailable. Check your MongoDB connection."
    });
  }

  try {
    const stats = await Stats.findOne().lean();

    // These zeros are only an empty-dashboard response.
    // They are NOT saved as fake statistics in MongoDB.
    if (!stats) {
      return res.json({
        delivered: 0,
        active: 0,
        countries: 0,
        clients: 0
      });
    }

    return res.json(stats);
  } catch (err) {
    console.error("STATS LOAD ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to load stats"
    });
  }
});

// ================================
// UPDATE STATISTICS FROM ADMIN
// ================================

app.put("/api/stats", async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: "Database unavailable. Statistics were not saved."
    });
  }

  try {
    const fields = ["delivered", "active", "countries", "clients"];
    const updates = {};

    for (const field of fields) {
      const value = req.body[field];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
      ) {
        return res.status(400).json({
          error: `Please provide a valid non-negative number for ${field}`
        });
      }

      updates[field] = Number(value);
    }

    // Update the existing document, or create it on the first save.
    // No hard-coded password and no hard-coded sample statistics.
    const stats = await Stats.findOneAndUpdate(
      {},
      { $set: updates },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("✅ STATS SAVED:", updates);

    return res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error("STATS UPDATE ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to save statistics"
    });
  }
});

// ================================
// UPDATE SHIPMENT FROM ADMIN
// ================================

app.put("/api/shipments/:trackingNumber", async (req, res) => {
  try {
    const {
      currentStatus,
      historyItem
    } = req.body;

    let shipment;

    if (isDbConnected()) {
      shipment = await Shipment.findOne({
        trackingNumber: req.params.trackingNumber
      });
    } else {
      shipment = mockShipments.find(
        (item) =>
          item.trackingNumber === req.params.trackingNumber
      );
    }

    if (!shipment) {
      return res.status(404).json({
        error: "Shipment not found"
      });
    }

    if (!shipment.history) {
      shipment.history = [];
    }

    if (currentStatus) {
      shipment.currentStatus = currentStatus;
    }

    if (historyItem) {
      shipment.history.push(historyItem);
      shipment.lastUpdated = new Date();
    }

    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      shipment.lat = Number(req.body.lat);
      shipment.lng = Number(req.body.lng);
    }

    if (req.body.deliveryDate) {
      shipment.deliveryDate = new Date(req.body.deliveryDate);
    }

    if (req.body.receiver) shipment.receiver = req.body.receiver;
    if (req.body.email) shipment.email = req.body.email;
    if (req.body.phone) shipment.phone = req.body.phone;
    if (req.body.destination) shipment.destination = req.body.destination;

    if (req.body.transportMode) {
      shipment.transportMode = req.body.transportMode;
    }

    if (req.body.isDelayed !== undefined) {
      shipment.isDelayed = req.body.isDelayed;
    }

    if (req.body.delayReason !== undefined) {
      shipment.delayReason = req.body.delayReason;
    }

    if (
      shipment.lastUpdated &&
      shipment.currentStatus !== "Delivered"
    ) {
      const diffHours =
        (Date.now() - new Date(shipment.lastUpdated).getTime()) /
        (1000 * 60 * 60);

      if (diffHours > 24) {
        shipment.isDelayed = true;
        shipment.delayReason = "No movement for 24+ hours";
      }
    }

    if (isDbConnected()) {
      await shipment.save();
    }

    // Send a status email when an email address is available.
    if (shipment.email) {
      let emailMessage = req.body.customerMessage?.trim();

      if (!emailMessage && currentStatus) {
        const messages = {
          "Shipment Registered":
            "Your shipment has been successfully registered into our logistics system and is awaiting processing.",
          "In Transit":
            "Your shipment is currently in transit and moving through our delivery network.",
          "Arrived at Facility":
            "Your shipment has arrived at one of our processing facilities and will continue to the next destination shortly.",
          "At Facility":
            "Your shipment is currently at one of our logistics hubs awaiting onward movement.",
          "Customs Clearance":
            "Your shipment is currently undergoing customs clearance procedures.",
          "Out for Delivery":
            "Your shipment is out for delivery and should arrive soon.",
          "Delivered":
            "Your shipment has been successfully delivered. Thank you for choosing Delta Courier.",
          "Delayed":
            "There is a temporary delay affecting your shipment. Our logistics team is actively working to resolve it."
        };

        emailMessage =
          messages[shipment.currentStatus] ||
          "Your shipment status has been updated. Please track your package for the latest information.";
      }

      if (emailMessage) {
        sendEmail(
          shipment.email,
          "Shipment Update - Delta Courier",
          shipment.receiver,
          shipment.trackingNumber,
          emailMessage,
          shipment.currentStatus
        ).catch((err) => {
          console.error("EMAIL FAILED:", err.message);
        });
      }
    }

    return res.json({
      success: true,
      shipment
    });
  } catch (err) {
    console.error("UPDATE SHIPMENT ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to update shipment"
    });
  }
});

// ================================
// HEALTH CHECK
// ================================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: isDbConnected() ? "connected" : "disconnected"
  });
});

// ================================
// SERVE FRONTEND
// ================================

app.use(express.static(path.join(__dirname, "Delta-Frontend")));

app.use("/api/auth", authRoutes);

app.get("/admin/login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Delta-Frontend", "admin-login.html")
  );
});

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Delta-Frontend", "index.html")
  );
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
