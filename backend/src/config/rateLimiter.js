'use strict';

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('error', (err) => console.error('[Redis] Connection error:', err));

const rateLimitHandler = (req, res) => {
    console.warn(`[RATE LIMIT] IP: ${req.ip} | Route: ${req.originalUrl}`);
    return res.status(429).json({
        error: 'Too many requests. Please try again later.',
    });
};

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,      
    max: 10,                         
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rl:auth:',
    }),
    handler: rateLimitHandler,
});


const refreshLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,       
    max: 20,           
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rl:refresh:',
    }),
    handler: rateLimitHandler,
});

module.exports = {  authLimiter, refreshLimiter };