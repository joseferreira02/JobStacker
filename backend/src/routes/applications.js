const express = require('express');
const router = express.Router();
const { getAllApplications , GetSingleApplication } = require('../controllers/applicationController'); 
const { authenticate: authMiddleware } = require('../middleware/auth');


router.get('/', authMiddleware, getAllApplications);

router.get('/:id',authMiddleware, GetSingleApplication);


router.get('/api/auth/me', authMiddleware, (req, res) => {
    res.status(200).json({
        user: req.user 
    });
});

module.exports = router;
