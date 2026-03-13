const express = require('express');
const router = express.Router();
const { getJobById } = require('../controllers/jobController');
const { authenticate: authMiddleware } = require('../middleware/auth');

// GET /jobs/:id
// Retrieves a specific job and its company details
router.get('/:id', authMiddleware, getJobById);

module.exports = router;
