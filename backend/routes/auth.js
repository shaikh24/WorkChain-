const express = require('express'); const router = express.Router(); const jwt = require('jsonwebtoken'); const User = require('../models/User');
router.post('/signup', async (req,res)=>{ const { email, password, username, name } = req.body; const u = await User.create({ email, password, username, name }); res.json({ success:true, user: u }); });
router.post('/login', async (req,res)=>{ const { email } = req.body; const user = await User.findOne({ email }); const token = require('jsonwebtoken').sign({ id: user ? user._id : null }, process.env.JWT_SECRET || 'secret'); res.json({ success:true, token, user }); });
module.exports = router;
