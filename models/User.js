const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String }, // for admin or optional
  email: { type: String, unique: true, sparse: true }, // for customers
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'customer'], 
    default: 'customer' 
  }
});

module.exports = mongoose.model('User', userSchema);