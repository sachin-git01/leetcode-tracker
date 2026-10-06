const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Problem = require("../models/Problem");

const checkDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI not found in backend/.env");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("\n=======================================================");
    console.log("   🟢 MONGODB ATLAS LIVE DATABASE STATUS");
    console.log("=======================================================\n");

    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    console.log(`👤 REGISTERED USERS (${users.length} total):`);
    console.log("-------------------------------------------------------");

    if (users.length === 0) {
      console.log("  No users registered yet.");
    } else {
      for (const [i, u] of users.entries()) {
        const probCount = await Problem.countDocuments({ user: u._id });
        console.log(`  ${i + 1}. Name:       ${u.name}`);
        console.log(`     Email:      ${u.email}`);
        console.log(`     User ID:    ${u._id}`);
        console.log(`     Problems:   ${probCount} saved`);
        console.log(`     Registered: ${new Date(u.createdAt).toLocaleString()}\n`);
      }
    }

    const problems = await Problem.find({}).sort({ createdAt: -1 }).lean();
    console.log(`\n📚 SAVED PROBLEMS (${problems.length} total):`);
    console.log("-------------------------------------------------------");

    if (problems.length === 0) {
      console.log("  No problems added yet.");
    } else {
      problems.forEach((p, i) => {
        const fav = p.isFavorite ? "⭐" : " ";
        console.log(`  ${i + 1}. [${p.difficulty}] ${p.title} (${p.topic}) ${fav}`);
        if (p.note) console.log(`     Note: "${p.note}"`);
      });
    }

    console.log("\n=======================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

checkDatabase();
