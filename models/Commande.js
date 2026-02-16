import mongoose from "mongoose";

const CommandeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  phone: String,
  paymentType: String,
  orderNumber: String,
  cart: Array,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Commande", CommandeSchema);
