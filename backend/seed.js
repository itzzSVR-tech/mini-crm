// seed.js
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Load env vars
dotenv.config();

// Import models
const User = require("./models/User.js");
const Customer = require("./models/Customer.js");
const Lead = require("./models/Lead.js");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Clear existing data
    await User.deleteMany();
    await Customer.deleteMany();
    await Lead.deleteMany();

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await User.insertMany([
      { name: "Admin User", email: "admin@example.com", password: hashedPassword },
      { name: "Sales Rep", email: "sales@example.com", password: hashedPassword }
    ]);

    // Create sample customers
    const customers = await Customer.insertMany([
      { name: "Acme Corp", email: "contact@acme.com", phone: "123-456-7890" },
      { name: "Globex Inc", email: "info@globex.com", phone: "987-654-3210" }
    ]);

    // Create sample leads
    await Lead.insertMany([
      { title: "Website Redesign", status: "Open", customer: customers[0]._id },
      { title: "Mobile App Proposal", status: "In Progress", customer: customers[1]._id },
      { title: "SEO Contract", status: "Closed Won", customer: customers[0]._id }
    ]);

    console.log("🌱 Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
