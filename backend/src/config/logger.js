'use strict';

const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    // In production: raw JSON. In dev: pretty print
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } }
        : undefined,

    base: {
        env: process.env.NODE_ENV,
    },

    redact: {
        paths: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
        censor: '[REDACTED]',
    },
});

module.exports = logger;