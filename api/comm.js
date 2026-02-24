const mongoose = require("mongoose");
const Commande = require("../models/Commande");

module.exports.config = {
  api: {
    bodyParser: true,
  },
};

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URL, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  try {
    await connectDB();

    const body = req.body;

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

    let cart = [];

    if (body.cart) {
      const cartItems = Array.isArray(body.cart)
        ? body.cart
        : [body.cart];

      cart = cartItems.map(itemStr => {
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

    const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);

    const nouvelleCommande = new Commande({
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      paymentType,
      cart,
      total,
      orderNumber: Number(orderNumber || Date.now())
    });

    await nouvelleCommande.save();

    return res.redirect("/commande-reussie");

  } catch (err) {
    console.error("ERREUR API COMM:", err);
    return res.status(500).send("Erreur serveur");
  }
};