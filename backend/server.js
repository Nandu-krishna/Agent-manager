const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agents");
const listRoutes = require("./routes/lists");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/lists", listRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Create default admin user if doesn't exist
const createDefaultAdmin = async () => {
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");

  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const admin = new User({
        email: "admin@example.com",
        password: "admin123", // plaintext here; the schema pre-save will hash it automatically
        role: "admin",
      });

      await admin.save();
      console.log("Default admin created: admin@example.com / admin123");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});
