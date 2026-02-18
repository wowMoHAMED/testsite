const mongoose = require("mongoose");
require("dotenv").config();
const express = require('express');
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) throw new Error("MONGODB_URL manquant");
 
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      bufferCommands: false
    }).then(mongoose => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;
