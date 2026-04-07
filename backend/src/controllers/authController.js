const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../../models');
const { error } = require('console');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const issueTokens = async (user) => {

    const accessToken = jwt.sign(
        { username: user.username, email: user.email, sub: user.id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshTokenEntry = await RefreshToken.create({
        user_id: user.id,
        hashed_token: "pending", 
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        is_revoked: false
    });

    const refreshToken = jwt.sign(
        { 
            sub: user.id, 
            jti: refreshTokenEntry.id 
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    const hashed_token = hashToken(refreshToken);
    refreshTokenEntry.hashed_token = hashed_token;
    await refreshTokenEntry.save();

    return { accessToken, refreshToken };
};


const deleteToken = async (tokenID) => {
    await RefreshToken.destroy({
        where: { id: tokenID}
    });
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, and password are required' });
        }

    
        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ where: { email } }),
            User.findOne({ where: { username } })
        ]);

        if (existingEmail) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        if (existingUsername) {
            return res.status(409).json({ error: 'Username already in use' });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ username, email, password_hash });

        const { accessToken, refreshToken } = await issueTokens(user);

        res.cookie('refreshToken', refreshToken, {
                httpOnly: true,    
                secure: process.env.NODE_ENV === 'production',     
                sameSite: 'Strict',
            });
        return res.status(201).json({
            accessToken,
            user: { username: user.username, email: user.email }
        });

    } catch (err) {
        console.error('Register error:', err);
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
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = await issueTokens(user);


        res.cookie('refreshToken', refreshToken, {
                httpOnly: true,    
                secure: process.env.NODE_ENV === 'production',     
                sameSite: 'Strict',
            });

        return res.status(200).json({
            accessToken,
            user: { username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const refresh = async (req, res) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Missing Refresh Token" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        const tokenEntry = await RefreshToken.findByPk(tokenId);

        if (!tokenEntry) {
            return res.status(401).json({ error: "Token not found, please login again" });
        }

        const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        if (tokenEntry.is_revoked || tokenEntry.hashed_token !== incomingHash) {
            // Potential token theft — wipe all tokens for this user
            await RefreshToken.destroy({ where: { user_id: decoded.sub } });
            return res.status(403).json({ error: "Invalid token, please login again" });
        }

        const user = await User.findByPk(decoded.sub);
        if (!user) {
            return res.status(401).json({ error: "User not found, please login again" });
        }

        const accessToken = jwt.sign(
            { username: user.username, email: user.email, sub: user.id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        return res.status(200).json({ accessToken });

    } catch (err) {
        return res.status(401).json({ error: "Token expired or invalid, please login again" });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);

        if (!refreshToken) {
            return res.status(200).json({ message: 'Logged out1' });
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            res.clearCookie('refreshToken');
            return res.status(200).json({ message: 'Logged out2' });
        }

        await deleteToken(payload.jti);
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: 'Logged out3' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login, refresh, logout };
