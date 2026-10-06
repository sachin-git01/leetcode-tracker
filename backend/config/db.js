const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/leetcode_tracker";

    // Fix for Windows DNS resolution with mongodb+srv:// (ECONNREFUSED _mongodb._tcp)
    if (uri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (dnsErr) {
        console.warn("DNS server override warning:", dnsErr.message);
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
