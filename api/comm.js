const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Meal = require('../models/Meal');
const PDFDocument = require('pdfkit');
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


// Admin: list orders
router.get('/admin', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.render('layout', { content: `
    <h2>Orders (Admin)</h2>
    <ul>
      ${orders.map(o => `
        <li>
          ${o.mealName} — Qty: ${o.quantity} — Total: ${o.totalPrice} MAD
          — ${new Date(o.createdAt).toLocaleString()}
        </li>
      `).join('')}
    </ul>
  `});
});

// Count orders (global)
router.get('/count', async (req, res) => {
  const count = await Order.countDocuments();
  res.send(`Total orders: ${count}`);
});

// Add to cart (stores in session)
router.post('/cart/add', async (req, res) => {
  try {
    const { mealId, quantity } = req.body;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.send('Meal not found');

    const qty = Number(quantity) || 1;
    const lineTotal = qty * meal.price;

    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push({
      mealId: meal._id,
      mealName: meal.name, 
      image: meal.image,
      quantity: qty,
      unitPrice: meal.price,
      lineTotal
    });

    res.redirect('/');
  } catch (err) {
    console.error('Error adding to cart', err);
    res.status(500).send('Erreur interne');
  }
});

// Remove item from cart by index
router.post('/cart/remove', (req, res) => {
  try {
    const idx = parseInt(req.body.index, 10);
    if (isNaN(idx)) return res.redirect('/');
    if (!req.session.cart) req.session.cart = [];
    if (idx >= 0 && idx < req.session.cart.length) {
      req.session.cart.splice(idx, 1);
    }
    res.redirect('/');
  } catch (err) {
    console.error('Error removing from cart', err);
    res.status(500).send('Erreur interne');
  }
});

const mongoose = require('mongoose');

// Schema commande
const orderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String, 
  email: String,
  phone: String,
  postalCode: String,
  cart: Array,
  total: Number,
  paymentType: String,
  orderNumber: Number,
  createdAt: { type: Date, default: Date.now }
});


const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    let resourceType = "image";

    // si le fichier est une vidéo
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    }

    return {
      folder: "restaurant",
      resource_type: resourceType
    };
  }
});


// Checkout page
router.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  res.render('checkout', { cart, cartTotal });
});

router.post('/checkout', async (req, res) => {
  try {
    const { firstName, lastName, address, email, phone, postalCode, paymentType } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/');

    const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

    // ✅ compter les commandes existantes
    const count = await Order.countDocuments();

    // ✅ créer la nouvelle commande avec numéro incrémenté
    const newOrder = await Order.create({
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      cart,
      total: cartTotal,
      orderNumber: count + 1 , 
      paymentType
       // ← numéro clair
    });

    req.session.cart = [];

    res.render('confirm', {
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      cart,
      paymentType,
      order: req.session.order,
      total: cartTotal,
      createdAt: newOrder.createdAt,
      orderNumber: newOrder.orderNumber 
      // ← numéro lisible
    });

  } catch (err) {
    console.error('Erreur lors de la sauvegarde de la commande', err);
    res.status(500).send('Erreur interne');
  }
});

// Page commandes admin
router.get('/commandes', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('commandes', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});


const multer = require("multer");

module.exports = multer({ storage });
// Exemple d’ajout au panier pour test

module.exports = router;
 