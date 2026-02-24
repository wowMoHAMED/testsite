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
      total,
      orderNumber,
    } = body;
 
    // Recupération panier
    // cart[0][mealName], cart[0][quantity], etc.
 let cart = [];
if (body.cart) {
  cart = body.cart.map(itemStr => {
    const item = JSON.parse(itemStr);
    return {
      mealId: item.mealId,
      mealName: item.mealName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      image: item.image,
      video: item.video
    };
  });
}


    // Création nouvelle commande
    const nouvelleCommande = new Commande({
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      paymentType: Array.isArray(paymentType) ? paymentType[0] : paymentType,
      cart,
      total: Number(total || 0),
      orderNumber: Number(orderNumber || Date.now()),
    });

    await nouvelleCommande.save();

    // Redirection vers page succès
    res.writeHead(302, { Location: "/commande-reussie" });
    res.end();
 

  } catch (err) {
    console.error("ERREUR API COMM:", err);
    res.status(500).send("Erreur serveur");

  }
// Page commandes admin
router.get('/commandes', async (req, res) => {
  try {
    const orders = await Commande.find().sort({ createdAt: -1 });
    res.render('commandes', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});





};
