const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('../models/Transaction');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Webhook worker started');
  setInterval(async () => {
    const pending = await Transaction.find({ status: 'pending' }).limit(10);
    for (const tx of pending) {
      tx.status = 'completed';
      await tx.save();
      console.log('Auto-confirmed', tx.tx_ref);
    }
  }, 15000);
}
run().catch(e => { console.error(e); process.exit(1) });
