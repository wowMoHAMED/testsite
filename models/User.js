const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: Number}
});

module.exports = mongoose.model('User', UserSchema);
 