require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    return mongoose.connection.db.admin().command({ ping: 1 });
  })
  .then(() => {
    console.log("✅ MongoDB ping OK");
    process.exit(0); // Exit after success
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit with failure
  });
