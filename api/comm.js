const mongoose = require("mongoose");
const Commande = require("../models/Commande");
const connectDB = require("../config/db");  // chemin selon ton projet

// MongoDB Atlas URI
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Méthode non autorisée");

  try {
    await connectDB();

    let body = req.body;

    // Si body est une string (cas Vercel), parser avec qs
    if (typeof body === "string") {
      const qs = require("qs");
      body = qs.parse(body);
    }

    // Normaliser cart
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

    const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);

    const nouvelleCommande = new Commande({
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      email: body.email,
      phone: body.phone,
      postalCode: body.postalCode,
      paymentType: body.paymentType,
      cart,
      total,
      orderNumber: Date.now()
    });

    await nouvelleCommande.save();

    res.render("commande-reussie", { order: nouvelleCommande });

  } catch (err) {
    console.error("ERREUR API COMM:", err);
    res.status(500).send("Erreur serveur");
  }
};
