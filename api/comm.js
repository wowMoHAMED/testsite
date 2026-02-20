const mongoose = require("mongoose");
const Commande = require("../models/Commande");

// MongoDB Atlas URI
const MONGODB_URI = process.env.MONGODB_URL;

// Cache connexion pour Vercel
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
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
      // body.cart peut être un objet si plusieurs produits
      if (Array.isArray(body.cart)) {
        cart = body.cart;
      } else {
        // conversion en tableau si un seul élément
        cart = Object.values(body.cart).map((item) => ({
          mealId: item.mealId || "",
          mealName: item.mealName || "",
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),
          image: item.image || "",
          video: item.video || "",
        }));
      }
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
};