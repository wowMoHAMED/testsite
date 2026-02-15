const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});
router.get('/', async (req, res) => {
  // Si le lien vient de confirm.ejs avec clearCart=true → vider le panier
  if (req.query.clearCart === 'true') {
    req.session.cart = []; // ✅ Vide le panier
  }

  const cart = req.session.cart || [];

  // Récupérer les plats depuis la base de données
  const meals = await Meal.find();

  res.render('index', {
    meals,
    cart,
    query: '',
    category: ''
  });
});


module.exports = router;
