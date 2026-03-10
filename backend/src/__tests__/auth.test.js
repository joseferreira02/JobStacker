const request = require('supertest');
const app = require('../app');
const { sequelize, User, RefreshToken } = require('../../models');

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterEach(async () => {
    await RefreshToken.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
    await sequelize.close();
});

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
describe('POST /auth/register', () => {
    const validPayload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
    };

    test('201 – registers a new user, returns accessToken and sets cookie', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(validPayload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).not.toHaveProperty('refreshToken'); // sent as cookie, not body
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
        expect(res.body.user).toMatchObject({
            username: 'testuser',
            email: 'test@example.com',
        });
        expect(res.body.user).not.toHaveProperty('password_hash');
    });

    test('400 – missing username', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing email', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing password', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', email: 'test@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('409 – duplicate email', async () => {
        await request(app).post('/auth/register').send(validPayload);

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'otheruser', email: 'test@example.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already in use');
    });

    test('409 – duplicate username', async () => {
        await request(app).post('/auth/register').send(validPayload);

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', email: 'other@example.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Username already in use');
    });
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
describe('POST /auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/auth/register').send({
            username: 'loginuser',
            email: 'login@example.com',
            password: 'password123',
        });
    });

    test('200 – logs in, returns accessToken and sets refreshToken cookie', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).not.toHaveProperty('refreshToken');
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
        expect(res.body.user).toMatchObject({ email: 'login@example.com' });
    });

    test('400 – missing email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('401 – wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });

    test('401 – unregistered email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });
});

// ---------------------------------------------------------------------------
// GET /auth/refresh
// ---------------------------------------------------------------------------
describe('GET /auth/refresh', () => {
    let refreshTokenCookie;

    beforeEach(async () => {
        const res = await request(app).post('/auth/login').send({
            email: 'refresh@example.com',
            password: 'password123',
        });
        // May get 401 on first run before user exists — register first
        if (res.status !== 200) {
            await request(app).post('/auth/register').send({
                username: 'refreshuser',
                email: 'refresh@example.com',
                password: 'password123',
            });
            const loginRes = await request(app).post('/auth/login').send({
                email: 'refresh@example.com',
                password: 'password123',
            });
            refreshTokenCookie = loginRes.headers['set-cookie'][0].split(';')[0];
        } else {
            refreshTokenCookie = res.headers['set-cookie'][0].split(';')[0];
        }
    });

    test('200 – returns a new accessToken when refresh token cookie is valid', async () => {
        const res = await request(app)
            .get('/auth/refresh')
            .set('Cookie', refreshTokenCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    test('401 – missing refresh token cookie', async () => {
        const res = await request(app).get('/auth/refresh');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------
describe('POST /auth/logout', () => {
    let refreshTokenCookie;

    beforeEach(async () => {
        await request(app).post('/auth/register').send({
            username: 'logoutuser',
            email: 'logout@example.com',
            password: 'password123',
        });
        const loginRes = await request(app).post('/auth/login').send({
            email: 'logout@example.com',
            password: 'password123',
        });
        refreshTokenCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    });

    test('200 – logs out and clears the cookie', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', refreshTokenCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        // Cookie should be cleared
        const cookies = res.headers['set-cookie'];
        if (cookies) {
            expect(cookies[0]).toMatch(/refreshToken=;/);
        }
    });

    test('200 – logout with no cookie still succeeds gracefully', async () => {
        const res = await request(app).post('/auth/logout');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    test('401 – refresh token is invalid after logout', async () => {
        await request(app)
            .post('/auth/logout')
            .set('Cookie', refreshTokenCookie);

        const res = await request(app)
            .get('/auth/refresh')
            .set('Cookie', refreshTokenCookie);

        expect(res.status).toBe(401);
    });
});

