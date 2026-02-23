const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande');   // ✅ ton vrai modèle
const Meal = require('../models/Meal');
const PDFDocument = require('pdfkit');

// Ajouter au panier (stocké en session)
router.post('/cart/add', async (req, res) => {
  try {
    const { mealId, quantity } = req.body;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.send('Produit introuvable');

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

    res.redirect('/#cart');   // ✅ redirige vers la section panier
  } catch (err) {
    console.error('Erreur ajout panier', err);
    res.status(500).send('Erreur interne');
  }
});

// Supprimer un produit du panier
router.post('/cart/remove', (req, res) => {
  try {
    const idx = parseInt(req.body.index, 10);
    if (isNaN(idx)) return res.redirect('/');
    if (!req.session.cart) req.session.cart = [];
    if (idx >= 0 && idx < req.session.cart.length) {
      req.session.cart.splice(idx, 1);
    }
    res.redirect('/#cart');
  } catch (err) {
    console.error('Erreur suppression panier', err);
    res.status(500).send('Erreur interne');
  }
});

// Page checkout
router.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  res.render('checkout', { cart, cartTotal });
});

// Validation de commande
router.post('/checkout', async (req, res) => {
  try {
    const { firstName, lastName, address, email, phone, postalCode, paymentType } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/');

    const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

    // Compter les commandes existantes
    const count = await Commande.countDocuments();

    // Créer une nouvelle commande
    const newCommande = await Commande.create({
      firstName,
      lastName,
      address,
      email,
      phone,
      postalCode,
      cart,
      total: cartTotal,
      orderNumber: count + 1,
      paymentType
    });

    // Vider le panier
    req.session.cart = [];

    // Afficher confirmation
    res.render('commande-reussie', {
      order: newCommande
    });

  } catch (err) {
    console.error('Erreur lors du checkout', err);
    res.status(500).send('Erreur interne');
  }
});

// Page commandes admin
router.get('/commandes', async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ createdAt: -1 });
    res.render('cominfo', { commandes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Exporter en PDF
router.get('/commandes/pdf', async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ createdAt: -1 });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=commandes.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Liste des commandes", { align: "center" });
    doc.moveDown();

    commandes.forEach(cmd => {
      doc.fontSize(14).text(`Client: ${cmd.firstName} ${cmd.lastName}`);
      doc.text(`Adresse: ${cmd.address}`);
      doc.text(`Email: ${cmd.email}`);
      doc.text(`Téléphone: ${cmd.phone}`);
      doc.text(`Code postal: ${cmd.postalCode}`);
      doc.text(`Numéro de commande: ${cmd.orderNumber}`);
      doc.text(`Date: ${new Date(cmd.createdAt).toLocaleString()}`);
      doc.text(`Paiement: ${cmd.paymentType}`);
      doc.moveDown();

      doc.text("Produits:");
      cmd.cart.forEach(item => {
        doc.text(`- ${item.mealName} | Qté: ${item.quantity} | Prix: ${item.lineTotal} MAD`);
      });

      doc.moveDown();
      doc.text(`Total: ${cmd.total} MAD`, { underline: true });
      doc.moveDown().moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur PDF");
  }
});

module.exports = router;
