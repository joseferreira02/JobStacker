const express = require('express');
const router = express.Router();
const { applications } = require('../controllers/applicationController'); 
const { authenticate: authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: User job applications
 */

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get all applications for the logged-in user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated list of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, applications);


router.get('/api/auth/me', authMiddleware, (req, res) => {
    res.status(200).json({
        user: req.user 
    });
});

module.exports = router;
