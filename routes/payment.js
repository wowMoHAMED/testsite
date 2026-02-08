const express = require('express');
const router = express.Router();

// Paiement en ligne via CMI
router.post('/cmi', async (req, res) => {
  // Exemple de redirection vers CMI Maroc
  // Tu dois remplacer les valeurs par celles fournies par CMI (merchantId, clé, etc.)
  const formData = {
    amount: req.body.total,
    currency: "MAD",
    merchantId: "TON_MERCHANT_ID",
    orderId: req.body.orderNumber,
    returnUrl: "http://tonsite.com/payment/cmi/callback"
  };

  res.render('redirectCMI', { formData });
});

// Callback retour CMI
router.post('/cmi/callback', async (req, res) => {
  if (req.body.status === "success") {
    res.render('success', { message: "✅ Paiement en ligne réussi !" });
  } else {
    res.render('error', { message: "❌ Paiement en ligne échoué." });
  }
});

module.exports = router;
