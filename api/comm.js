const mongoose = require("mongoose");
const Commande = require("../models/Commande");
const express = require('express');
const router = express.Router();
// MongoDB Atlas URI


// Cache connexion pour Vercel
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URL, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Fonction exportée pour Vercel
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  try {
    await connectDB();

    // req.body arrive en string si formulaire HTML classique
    // on parse manuellement
    let body = req.body;
    if (typeof body === "string") {
      const qs = require("qs");
      body = qs.parse(body);
    }

    // Recupération des infos client
    const {
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      paymentType,
    
      orderNumber,
    } = body;
 
    // Recupération panier
    // cart[0][mealName], cart[0][quantity], etc.
 let cart = [];
if (body.cart) {
  cart = Array.isArray(body.cart) ? body.cart : Object.values(body.cart);
  cart = cart.map(itemStr => {
    const item = typeof itemStr === "string" ? JSON.parse(itemStr) : itemStr;
    return {
      mealId: item.mealId || "",
      mealName: item.mealName || "",
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
      lineTotal: Number(item.lineTotal || 0),
      image: item.image || "",
      video: item.video || ""
    };
  });
}

// Calcul du total
const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);

const nouvelleCommande = new Commande({
  firstName,
  lastName,
  address,
  email,
  phone,
  postalCode,
  paymentType: Array.isArray(paymentType) ? paymentType[0] : paymentType,
  cart,
  total,
  orderNumber: Number(orderNumber || Date.now())
});

    await nouvelleCommande.save();


    // Redirection vers page succès
    res.writeHead(302, { Location: "/commande-reussie" });
    res.end();
 

  } catch (err) {
    console.error("ERREUR API COMM:", err);
    return res.status(500).send("Erreur serveur");

  }
// Page commandes admin

};
