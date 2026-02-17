require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

let isConnected;

async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur connexion DB:", err);
  }
}

module.exports = connectDB;
