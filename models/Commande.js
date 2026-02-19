const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  phone: String,
  postalCode: String,
  cart: [
    {
      mealId: String,
      mealName: String,
      quantity: Number,
      unitPrice: Number,
      lineTotal: Number,
      image: String,
      video: String
    }
  ],
  total: Number,
  orderNumber: Number,
  paymentType:String,
  createdAt: { type: Date, default: Date.now }
});  

module.exports = mongoose.model('Commande', OrderSchema);