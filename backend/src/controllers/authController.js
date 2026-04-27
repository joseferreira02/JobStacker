'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, RefreshToken } = require('../../models');
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    REFRESH_TOKEN_EXPIRY_MS,
} = require('../config/jwt');

const logger = require('../config/logger');

const authLogger = logger.child({ scope: 'auth' });

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

// ── Helpers ───────────────────────────────────────────────────────────────────

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const issueTokens = async (user) => {
    const refreshTokenEntry = await RefreshToken.create({
        user_id: user.id,
        hashed_token: 'pending',
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        is_revoked: false,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id, refreshTokenEntry.id);

    refreshTokenEntry.hashed_token = hashToken(refreshToken);
    await refreshTokenEntry.save();

    return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
};

// ── Controllers ───────────────────────────────────────────────────────────────

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, and password are required' });
        }

        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ where: { email } }),
            User.findOne({ where: { username } }),
        ]);

        if (existingEmail) return res.status(409).json({ error: 'Email already in use' });
        if (existingUsername) return res.status(409).json({ error: 'Username already in use' });

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ username, email, password_hash });

        const { accessToken, refreshToken } = await issueTokens(user);
        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            accessToken,
            user: { username: user.username, email: user.email },
        });


    } catch (err) {
        authLogger.error({ err, route: 'register' }, 'Unexpected error during registration');
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        const valid = user && await bcrypt.compare(password, user.password_hash);


        if (!valid) {
            authLogger.warn({ route: 'login', ip: req.ip, userID: user.id || null }, 'Failed login attempt — invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = await issueTokens(user);
        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            accessToken,
            user: { username: user.username, email: user.email },
        });

    } catch (err) {
        authLogger.error({ err, route: 'login' }, 'Unexpected error during login');
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

    try {

        const decoded = verifyRefreshToken(refreshToken);

        const tokenEntry = await RefreshToken.findByPk(decoded.jti);
        if (!tokenEntry) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const incomingHash = hashToken(refreshToken);

        if (tokenEntry.is_revoked || tokenEntry.hashed_token !== incomingHash) {
            authLogger.warn({ route: 'refresh', userId: decoded.sub, jti: decoded.jti, ip: req.ip }, 'Refresh token reuse detected — revoking all sessions');
            await RefreshToken.destroy({ where: { user_id: decoded.sub } });
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await User.findByPk(decoded.sub);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        await RefreshToken.destroy({ where: { id: decoded.jti } });
        const { accessToken, refreshToken } = await issueTokens(user);
        setRefreshCookie(res, refreshToken);
        return res.status(200).json({ accessToken });


    } catch (err) {
        authLogger.error({ err: err.message, route: 'refresh' }, 'Refresh token validation failed');
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.clearCookie('refreshToken');
            return res.status(200).json({ message: 'Logged out' });
        }

        try {
            const payload = verifyRefreshToken(refreshToken);
            await RefreshToken.destroy({ where: { id: payload.jti } });
        } catch {
            authLogger.warn({ route: 'logout', ip: req.ip }, 'Logout attempted with invalid or expired token');
        }

        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logged out' });

    } catch (err) {
        authLogger.error({ err, route: 'logout' }, 'Unexpected error during logout');
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login, refresh, logout };