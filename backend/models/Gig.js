const mongoose = require('mongoose');
const GigSchema = new mongoose.Schema({
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  category: String,
  price: Number,
  seller_level: String,
  seller_verified: Boolean
}, { timestamps: true });
module.exports = mongoose.model('Gig', GigSchema);
