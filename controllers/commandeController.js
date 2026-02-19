/*const dbConnect = require("../lib/mongodb");
const Commande = require("../models/Commande");


async function enregistrerCommande(req, res) {

  try {
    await dbConnect();

    const nouvelleCommande = new Commande(req.body);
    await nouvelleCommande.save();

    return res.redirect("/commande-reussie?t=" + Date.now());

  } catch (error) {
    console.log("ERREUR:", error);
    return res.status(500).send("Erreur DB");
  }
}

module.exports = enregistrerCommande;*/
