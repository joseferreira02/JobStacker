const express = require('express');
const router = express.Router();
const { getCompanyById } = require('../controllers/companyController');
const { authenticate: authMiddleware } = require('../middleware/auth');

// GET /companies/:id
// Retrieves a specific company and its jobs
router.get('/:id', authMiddleware, getCompanyById);

module.exports = router;
