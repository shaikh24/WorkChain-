const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Gig = require('../models/Gig');
const Project = require('../models/Project');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({}); await Gig.deleteMany({}); await Project.deleteMany({});
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', username: 'admin', password: 'x', role: 'admin', kyc_verified: true, level: 'Diamond', level_points: 3000 });
  const u1 = await User.create({ name: 'Alice', email: 'alice@example.com', username: 'alice', password: 'x', kyc_verified: true, level: 'Platinum', level_points: 1200 });
  const u2 = await User.create({ name: 'Bob', email: 'bob@example.com', username: 'bob', password: 'x', kyc_verified: false, level: 'Gold', level_points: 600 });
  const g1 = await Gig.create({ seller_id: u1._id, title: 'Build a Flutter App', description: 'Cross platform mobile app', category: 'Development', price: 100, seller_level: 'Platinum', seller_verified: true });
  const g2 = await Gig.create({ seller_id: u2._id, title: 'Design a Logo', description: 'Modern logo design', category: 'Design', price: 30, seller_level: 'Gold', seller_verified: false });
  await Project.create({ gig_id: g1._id, client_id: u2._id, freelancer_id: u1._id, escrow_amount: 0, status: 'Pending' });
  console.log('Seed done'); process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1) });
