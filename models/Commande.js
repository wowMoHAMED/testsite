const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({

  nom: {
    type: String,
    required: true
  },

  telephone: {
    type: String,
    required: true
  },

  adresse: {
    type: String,
    required: true
  },

  produits: {
    type: String,
    required: true
  },

  total: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { collection: "commandes" });

module.exports =
  mongoose.models.Commande ||
  mongoose.model("Commande", commandeSchema);
