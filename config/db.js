const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur connexion MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
