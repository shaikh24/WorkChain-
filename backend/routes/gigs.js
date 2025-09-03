const express = require('express'); const router = express.Router(); const Gig = require('../models/Gig');
router.get('/', async (req,res)=>{ const gigs = await Gig.find({}).limit(50); res.json(gigs); });
module.exports = router;
