const enregistrerCommande = require("../controllers/commandeController");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  return enregistrerCommande(req, res);
};
