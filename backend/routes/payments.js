const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const uuid = require('uuid');

const PI_BASE = process.env.PI_API_BASE || 'https://api.minepi.com/v2';
const PI_KEY = process.env.PI_API_KEY || '';
const WEBHOOK_SECRET = process.env.PI_WEBHOOK_SECRET || '';

// Create payment (server-side) - client should open Pi SDK on frontend to create payment and receive paymentId.
// For some Pi flows, frontend creates payment via SDK and notifies server. This endpoint supports server-created flow.
router.post('/create', async (req, res) => {
  try {
    const { projectId, amount, currency, memo } = req.body;
    // create a pending transaction in DB
    const txRef = uuid.v4();
    const tx = await Transaction.create({ tx_ref: txRef, amount, currency: currency || 'Pi', status: 'pending', meta: { projectId } });

    // Option A: Server creates payment intent via Pi API (if allowed)
    // Example request to Pi: POST /v2/payments (this is illustrative — confirm exact endpoint)
    const payload = {
      amount,
      currency: currency || 'Pi',
      reference: txRef,
      memo: memo || `Escrow deposit for project ${projectId}`
    };
    // Ask Pi to create a payment (replace endpoint per Pi docs if different)
    let paymentResponse = null;
    try {
      const resp = await axios.post(`${PI_BASE}/payments`, payload, { headers: { Authorization: `Key ${PI_KEY}` } });
      paymentResponse = resp.data;
    } catch (e) {
      // If Pi create endpoint is not available for your app, the frontend will use Pi SDK instead.
      paymentResponse = null;
    }

    // Save payment id if returned
    if (paymentResponse && paymentResponse.id) {
      tx.payment_id = paymentResponse.id;
      await tx.save();
    }

    // Return tx and payment info. Frontend may open Pi SDK or redirect to payment_url if provided.
    res.json({ success: true, tx, payment: paymentResponse, payment_url: paymentResponse?.payment_url || null });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Approve payment (called by server when frontend SDK triggers onReadyForServerApproval)
router.post('/:paymentId/approve', async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const resp = await axios.post(`${PI_BASE}/payments/${paymentId}/approve`, {}, { headers: { Authorization: `Key ${PI_KEY}` } });
    res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error('approve error', err?.response?.data || err.message);
    res.status(500).json({ error: 'approve failed' });
  }
});

// Complete payment (called by server when frontend SDK triggers onReadyForServerCompletion)
router.post('/:paymentId/complete', async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { txid } = req.body;
    const resp = await axios.post(`${PI_BASE}/payments/${paymentId}/complete`, { txid }, { headers: { Authorization: `Key ${PI_KEY}` } });
    // Optionally map payment to Transaction and mark completed
    const tx = await Transaction.findOne({ payment_id: paymentId }) || await Transaction.findOne({ tx_ref: txid });
    if (tx) {
      tx.status = 'completed';
      await tx.save();
      // update project escrow if present
      const projectId = tx.meta?.projectId;
      if (projectId) {
        const project = await Project.findById(projectId);
        if (project) {
          project.escrow_amount = (project.escrow_amount || 0) + tx.amount;
          await project.save();
        }
      }
    }
    res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error('complete error', err?.response?.data || err.message);
    res.status(500).json({ error: 'complete failed' });
  }
});

// Webhook for Pi to POST payment events. Verify signature and update tx.
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const sig = req.headers['x-pi-signature'] || req.headers['x-signature'] || '';
    const raw = req.body;
    // verify signature using HMAC SHA256
    if (WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
      hmac.update(raw);
      const digest = hmac.digest('hex');
      if (digest !== sig) {
        console.warn('webhook signature mismatch', digest, sig);
        return res.status(400).send('invalid signature');
      }
    }
    let body = null;
    try { body = JSON.parse(raw.toString()); } catch (e) { body = null; }
    const reference = body?.reference || body?.payment?.reference || body?.payment_id || body?.paymentId || body?.tx_ref;
    if (!reference) return res.status(400).send('missing reference');
    // find tx by reference or payment id
    const tx = await Transaction.findOne({ tx_ref: reference }) || await Transaction.findOne({ payment_id: reference });
    if (tx) {
      tx.status = body?.status || 'completed';
      await tx.save();
      // update project escrow
      const projectId = tx.meta?.projectId;
      if (projectId) {
        const project = await Project.findById(projectId);
        if (project) {
          project.escrow_amount = (project.escrow_amount || 0) + tx.amount;
          await project.save();
        }
      }
    }
    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook handling error', err);
    res.status(500).send('error');
  }
});

// Check payment status by tx_ref or payment id
router.get('/status/:ref', async (req, res) => {
  try {
    const ref = req.params.ref;
    const tx = await Transaction.findOne({ $or: [{ tx_ref: ref }, { payment_id: ref }] });
    if (!tx) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, tx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
