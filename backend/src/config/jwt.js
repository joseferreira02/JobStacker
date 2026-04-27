'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');


const ACCESS_TOKEN_EXPIRY  = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const JWT_ISSUER   = process.env.JWT_ISSUER;    
const JWT_AUDIENCE = process.env.JWT_AUDIENCE; 

let PRIVATE_KEY, PUBLIC_KEY;

try {
    PRIVATE_KEY = fs.readFileSync('./keys/private.pem');
    PUBLIC_KEY  = fs.readFileSync('./keys/public.pem');
} catch (err) {
    console.error('[FATAL] Could not load JWT keys:', err.message);
    process.exit(1); 
}



const signAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            email: user.email,
            iss: JWT_ISSUER,
            aud: JWT_AUDIENCE,
            nbf: Math.floor(Date.now() / 1000),
        },
        PRIVATE_KEY,
        { algorithm: 'RS256', expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, PUBLIC_KEY, {
        algorithms: ['RS256'],      
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });
};


const signRefreshToken = (userId, jti) => {
    return jwt.sign(
        {
            sub: userId,
            jti,                       
            iss: JWT_ISSUER,
            aud: `${JWT_AUDIENCE}-refresh`,  
        },
        process.env.JWT_REFRESH_SECRET,
        { algorithm: 'HS256', expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: `${JWT_AUDIENCE}-refresh`, 
    });
};


module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    REFRESH_TOKEN_EXPIRY_MS,
};