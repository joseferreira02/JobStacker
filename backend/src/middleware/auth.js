'use strict';

const {
    verifyAccessToken
} = require('../config/jwt');
const logger = require('../config/logger');

const authLogger = logger.child({ scope: 'auth' });


const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (err) {
        authLogger.warn({ route: req.path, ip: req.ip, err: err.name, msg: err.message }, 'Auth token validation failed');
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = { authenticate };
