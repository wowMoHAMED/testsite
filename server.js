require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const Stripe = require('stripe');
const stripe = Stripe('TA_CLE_SECRETE_STRIPE'); // remplace par ta clé secrète Stripe
// <-- obligatoire pour charger .env

 // Vérifie le chemin exact

 app.use(session({
  secret: "secretAdmin123",
  resave: false,
  saveUninitialized: false
}));
// View engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('public/uploads'));
const mealsRouter = require('./routes/meals');
app.use('/meals', mealsRouter);
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes); 



app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Connexion MongoDB (Mongoose 7+)


// connexion MongoDB
mongoose.connect("mongodb+srv://chiguermohamed41_db_user:OOMQ6cPkqQL4hsmB@cluster23.nlm4h2d.mongodb.net/?appName=Cluster23")
.then(()=> console.log("MongoDB connecté"));
 
// Routes 


// Serveur

// Routes
const mealRoutes = require('./routes/meals');
const orderRoutes = require('./routes/orders');
app.use('/meals', mealRoutes);
app.use('/orders', orderRoutes);
const commroutes= require('./api/comm');
app.use('/comm',commroutes);

// Main page
const Meal = require('./models/Meal');
app.get('/', async (req, res) => {
  const q = req.query.q || '';
  const cat = req.query.cat || '';
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (cat) filter.category = cat;

  const meals = await Meal.find(filter).sort({ createdAt: -1 });
  // Cart stored in session (default to empty array to avoid 'cart is not defined')
  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

  res.render('index', { 
    meals,
    brand: {
      name: "Restaurant",
      slogan: "",
      logo: "/images/restaurant.jpg",
      about: "Authentic cuisine in Fès—fresh, local, and crafted with care.",
      hours: "Mon–Sun: 11:00–23:00",
      contact: { phone: "+2126XXXXXXXX", email: "contact@restaurant.ma", address: "Fès, Maroc" }
    },
    maps: {
      address: "Fès, Maroc",
      lat: 34.0331, lon: -5.0003, zoom: 15,
      markerLabel: " Restaurant",
      directionsMode: "driving"
    },
    query: q, category: cat,
    user: req.session.user,
    cart,
    cartTotal
  });
});
app.get('/', async (req, res) => {
  const meals = await Meal.find();   // récupère tous les plats
  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  res.render('index', { meals, cart, cartTotal, query: '', category: '' });
});
 

app.post('/payment/stripe', async (req, res) => {
  try {
    const { orderNumber, total } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Visa, Mastercard
      line_items: [
        {
          price_data: {
            currency: 'mad', // Dirham marocain
            product_data: {
              name: `Commande #${orderNumber}`,
            },
            unit_amount: total * 100, // montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la création de la session Stripe");
  }
});


  
app.get('/orders/confirm', (req, res) => {
  res.render('confirm', {
    order: req.session.order
  });
});
app.get('/comm/confirm', (req, res) => {
  res.render('confirm', {
    order: req.session.order
  });
});


app.post('/pay-online', async (req, res) => {
  try {
    const cartTotal = Number(req.body.cartTotal);

    if (!cartTotal || cartTotal <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Commande Restaurant'
            },
            unit_amount: cartTotal * 100
          },
          quantity: 1
        }
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/checkout'
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur paiement en ligne' });
  }
});
//verification admin
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
app.get('/admin-login', async (req, res) => {
  const adminExists = await Admin.findOne();
  
  if (!adminExists) {
    // Première fois
    return res.render('admin-create');
  }

  res.render('admin-login');
});
app.post('/admin-create', async (req, res) => {
  const { firstname, lastname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Les mots de passe ne correspondent pas');
  }

  const exists = await Admin.findOne();
  if (exists) {
    return res.send('Admin déjà créé');
  }

  const hash = await bcrypt.hash(password, 10);

  const admin = new Admin({
    firstname,
    lastname,
    password: hash
  });

  await admin.save();

  res.redirect('/admin-login');
});
app.post('/admin-login', async (req, res) => {
  const { firstname, lastname, password } = req.body;

  const admin = await Admin.findOne({ firstname, lastname });
  if (!admin) {
    return res.send('fail page...');
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    return res.send('fail page...');
  }

  req.session.admin = true;
  res.redirect('/admin');
});

// Admin page
app.get('/admin', async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.render('admin', { meals });
  } catch (err) {
    console.error('[meals] GET /admin failed', err);
    res.status(500).send('Erreur interne');
  }
});


//fin de verification admin


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// fichiers statiques
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
// //IMPORTANT POUR VERCEL
const Order = require('./models/Order');

app.get("/confirm/:id", async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.redirect("/");
    }

    res.render("confirm", {
      cart: order.cart,
      firstName: order.firstName,
      lastName: order.lastName,
      address: order.address,
      email: order.email,
      phone: order.phone,
      postalCode: order.postalCode,
      total: order.total,
      orderNumber: order._id
    });

  } catch (err) {
    console.log(err);
    res.redirect("/");
  }

  app.use(express.urlencoded({ extended: true }));
app.use(express.json());



});


const commRoutes = require("./api/comm");
app.use("/api/comm", commRoutes);
app.get("/checkout", (req, res) => {
  res.render("checkout", {
    cart: [],
    cartTotal: 0
  });
});

app.get("/commande-reussie", (req, res) => {
  res.render("commande-reussie");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
module.exports = app;

