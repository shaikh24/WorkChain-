const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  tx_ref: { type: String, unique: true },
  payment_id: String,
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  currency: { type: String, default: 'Pi' },
  status: { type: String, enum: ['pending','completed','failed'], default: 'pending' },
  meta: Object
}, { timestamps: true });
module.exports = mongoose.model('Transaction', TransactionSchema);
