const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  image: String,   // e.g., /images/pizza.jpg
  video: String,   // e.g., /videos/pizza.mp4
  ordersCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  availability: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Meal', MealSchema);
