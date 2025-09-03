const express = require('express'); const router = express.Router(); const Project = require('../models/Project');
router.post('/', async (req,res)=>{ const p = await Project.create(req.body); res.json(p); });
module.exports = router;
