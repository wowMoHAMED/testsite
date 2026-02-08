const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true } // hashé
});

module.exports = mongoose.model('Admin', adminSchema);
