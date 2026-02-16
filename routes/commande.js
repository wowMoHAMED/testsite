import express from "express";
import { connectDB } from "../lib/db.js";
import Commande from "../models/Commande.js";

const router = express.Router();

router.post("/commande", async (req, res) => {
  try {
    await connectDB();

    const orderNumber = "CMD-" + Date.now();
    const cartItems = req.body.cart.map(item => ({
      mealName: item.mealName,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      image: item.image
    }));

    const newOrder = new Commande({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone,
      paymentType: req.body.paymentType,
      orderNumber,
      cart: cartItems,
      total: req.body.total
    });

    await newOrder.save();
    res.redirect("/confirm");
  } catch (err) {
    console.log("ERREUR SAVE:", err);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/confirm", (req, res) => {
  res.render("confirm");
});

router.get("/commandes", async (req, res) => {
  try {
    await connectDB();
    const orders = await Commande.find().sort({ createdAt: -1 });
    res.render("commandes", { orders });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur serveur");
  }
});

export default router;
