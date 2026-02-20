const app = require("../server");
module.exports = app;

const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log("MongoDB connecté"));

const Commande = require("./models/Commande");

// ROUTE CONFIRM
app.get("/confirm", async (req, res) => {
  const derniereCommande = await Commande.findOne().sort({date:-1});
  res.render("confirm", { commande: derniereCommande });
});

// EXPORT VERCEL
module.exports = app;
module.exports.handler = serverless(app);

 