const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escrow_amount: Number,
  currency: { type: String, default: 'Pi' },
  milestones: [{ title: String, amount: Number, status: String }],
  status: { type: String, default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);
