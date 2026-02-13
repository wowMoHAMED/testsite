const express = require("express");
const router = express.Router();

// Déconnexion simple (pas de session)
router.get("/logout", (req, res) => {
  // Ici on ne détruit pas la session, juste redirige
  res.redirect("/");
});

module.exports = router;
 