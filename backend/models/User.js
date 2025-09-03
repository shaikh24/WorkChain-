const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true, index: true },
  password: String,
  pi_wallet_id: String,
  role: { type: String, enum: ['user','admin'], default: 'user' },
  kyc_verified: { type: Boolean, default: false },
  level: { type: String, enum: ['Silver','Gold','Platinum','Diamond'], default: 'Silver' },
  level_points: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
